const Command = require('../structures/Command');

class MessageHandler {
    constructor(bot) {
        this.bot = bot;
        this.footer = '\n\n┌─────────────────┐\n│ Powered by Dineth MD │\n│ By Dineth Nethsara │\n└─────────────────┘';
    }

    async handle(message) {
        // Add signature to text messages
        if (message.text) {
            message.text += this.footer;
        }
        
        // Add signature to media captions
        if (message.caption) {
            message.caption += this.footer;
        }
    }

    // Helper method to add signature to any text
    addSignature(text) {
        return text + this.footer;
    }
}

module.exports = MessageHandler; 