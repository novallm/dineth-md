const session = require('../utils/SessionManager');

class SecurityHandler {
    constructor(bot) {
        this.bot = bot;
        this.spamThreshold = 5;
        this.spamWindow = 30000; // 30 seconds
        this.messageCache = new Map();
    }

    async handleMessage(message) {
        try {
            // Anti-spam protection
            if (await this.isSpam(message)) {
                await this.handleSpam(message);
                return;
            }

            // Protect against suspicious links
            if (await this.hasSuspiciousLinks(message)) {
                await this.handleSuspiciousContent(message);
                return;
            }

            // Group protection
            if (message.key.remoteJid.endsWith('@g.us')) {
                await this.protectGroup(message);
            }

        } catch (error) {
            console.error('Security handler error:', error);
        }
    }

    async protectGroup(message) {
        const groupId = message.key.remoteJid;
        const settings = session.getGroup(groupId).settings;

        // Anti-virus scan for documents
        if (message.message?.documentMessage) {
            await this.scanDocument(message);
        }

        // Protect against mass mentions
        if (message.message?.mentionedJid?.length > 10) {
            await this.handleMassMention(message);
        }

        // Protect against suspicious invites
        if (this.hasGroupInvite(message)) {
            await this.handleGroupInvite(message);
        }
    }

    async isSpam(message) {
        const userId = message.key.participant || message.key.remoteJid;
        const now = Date.now();

        if (!this.messageCache.has(userId)) {
            this.messageCache.set(userId, []);
        }

        const userMessages = this.messageCache.get(userId);
        userMessages.push(now);

        // Remove old messages outside spam window
        const recentMessages = userMessages.filter(time => now - time < this.spamWindow);
        this.messageCache.set(userId, recentMessages);

        return recentMessages.length > this.spamThreshold;
    }

    async handleSpam(message) {
        const userId = message.key.participant || message.key.remoteJid;
        const user = session.getUser(userId);
        user.warnings = (user.warnings || 0) + 1;

        await this.bot.sendMessage(message.key.remoteJid, {
            text: `⚠️ *SPAM DETECTED*\n\n@${userId.split('@')[0]} please avoid spamming!\nWarning: ${user.warnings}/3`,
            mentions: [userId]
        });
    }

    // Add legitimate protection features
    async addProtection(groupId) {
        const settings = session.getGroup(groupId).settings;
        settings.protection = {
            antiSpam: true,
            antiPhishing: true,
            antiVirus: true,
            antiMassMention: true,
            antiSuspiciousLink: true
        };
        await session.saveSession();
    }

    async handleSuspiciousLinks(message) {
        const text = message.message?.conversation || 
                    message.message?.imageMessage?.caption ||
                    message.message?.videoMessage?.caption;

        if (!text) return false;

        const suspiciousPatterns = [
            /bit\.ly/i,
            /goo\.gl/i,
            /tinyurl\.com/i,
            /phishing/i,
            /hack/i,
            /crash/i,
            /ban/i,
            /virus/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(text));
    }

    async handleMassMention(message) {
        const userId = message.key.participant || message.key.remoteJid;
        await this.bot.sendMessage(message.key.remoteJid, {
            text: `⚠️ *MASS MENTION DETECTED*\n\n@${userId.split('@')[0]} please avoid mass mentions!`,
            mentions: [userId]
        });
    }

    async scanDocument(message) {
        // Implement document scanning
        const doc = message.message.documentMessage;
        const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.msi', '.vbs'];
        
        if (suspiciousExtensions.some(ext => doc.fileName.toLowerCase().endsWith(ext))) {
            await this.handleSuspiciousContent(message);
            return true;
        }
        return false;
    }

    async handleGroupInvite(message) {
        const userId = message.key.participant || message.key.remoteJid;
        const groupId = message.key.remoteJid;
        const settings = session.getGroup(groupId).settings;

        if (settings.protection?.antiInvite) {
            await this.bot.sendMessage(groupId, {
                text: `⚠️ *UNAUTHORIZED INVITE DETECTED*\n\n@${userId.split('@')[0]} please don't share group invites!`,
                mentions: [userId]
            });
            return true;
        }
        return false;
    }
}

module.exports = SecurityHandler; 