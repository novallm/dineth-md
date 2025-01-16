class ErrorHandler {
    constructor(bot) {
        this.bot = bot;
        this.errors = new Map();
    }

    async handleError(error, context) {
        console.error('Error:', error);

        // Log error
        this.logError(error, context);

        // Send error message to user
        if (context.message) {
            await this.sendErrorMessage(context.message, error);
        }

        // Report critical errors
        if (this.isCriticalError(error)) {
            await this.reportCriticalError(error, context);
        }
    }

    async sendErrorMessage(message, error) {
        const errorMessage = `❌ *Error:* ${this.getErrorMessage(error)}`;
        await this.bot.sendMessage(message.key.remoteJid, { text: errorMessage });
    }

    getErrorMessage(error) {
        // User-friendly error messages
        const errorMessages = {
            'not_found': 'Resource not found',
            'invalid_format': 'Invalid format',
            'api_error': 'Service temporarily unavailable',
            'permission_denied': 'You don\'t have permission',
            'rate_limit': 'Please wait before trying again'
        };

        return errorMessages[error.code] || 'An error occurred';
    }

    logError(error, context) {
        const errorLog = {
            timestamp: new Date(),
            error: error.message,
            stack: error.stack,
            context: {
                command: context.command,
                user: context.message?.participant,
                chat: context.message?.key.remoteJid
            }
        };

        // Store error log
        this.errors.set(Date.now(), errorLog);
    }

    isCriticalError(error) {
        return error.code === 'CRITICAL' || 
               error.message.includes('AUTH') ||
               error.message.includes('FATAL');
    }

    async reportCriticalError(error, context) {
        const report = `⚠️ *CRITICAL ERROR REPORT* ⚠️\n\n` +
                      `*Error:* ${error.message}\n` +
                      `*Context:* ${JSON.stringify(context)}\n` +
                      `*Stack:* ${error.stack}\n` +
                      `*Time:* ${new Date().toISOString()}`;

        // Send to owner
        await this.bot.sendMessage(this.bot.config.ownerNumber + '@s.whatsapp.net', {
            text: report
        });
    }
}

module.exports = ErrorHandler; 