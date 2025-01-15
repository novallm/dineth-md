const badWords = require('../data/badwords.json');
const urlRegex = /(https?:\/\/[^\s]+)/g;

class AntiSpamHandler {
    constructor(bot) {
        this.bot = bot;
        this.warningCounts = new Map();
        this.maxWarnings = 3;
    }

    async handleMessage(message) {
        if (message.key.fromMe) return; // Ignore bot's own messages
        
        const text = message.message?.conversation || 
                    message.message?.imageMessage?.caption ||
                    message.message?.videoMessage?.caption;
        
        if (!text) return;

        const isAdmin = await this.isGroupAdmin(message);
        if (isAdmin) return; // Don't check admin messages

        // Check for bad words
        if (this.containsBadWords(text)) {
            await this.handleBadWord(message);
        }

        // Check for links
        if (this.containsLinks(text)) {
            await this.handleLink(message);
        }
    }

    containsBadWords(text) {
        return badWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
    }

    containsLinks(text) {
        return urlRegex.test(text);
    }

    async handleBadWord(message) {
        const userId = message.key.participant || message.key.remoteJid;
        const warnings = (this.warningCounts.get(userId) || 0) + 1;
        this.warningCounts.set(userId, warnings);

        const warningMessage = `⚠️ *BAD WORD DETECTED*\n\n` +
            `@${userId.split('@')[0]} Please don't use bad words!\n` +
            `Warning ${warnings}/${this.maxWarnings}`;

        await this.bot.sendMessage(message.key.remoteJid, {
            text: warningMessage,
            mentions: [userId]
        });

        // Delete the message if possible
        try {
            await this.bot.sendMessage(message.key.remoteJid, {
                delete: message.key
            });
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }

    async handleLink(message) {
        const userId = message.key.participant || message.key.remoteJid;
        const warnings = (this.warningCounts.get(userId) || 0) + 1;
        this.warningCounts.set(userId, warnings);

        const warningMessage = `⚠️ *LINK DETECTED*\n\n` +
            `@${userId.split('@')[0]} Links are not allowed!\n` +
            `Warning ${warnings}/${this.maxWarnings}`;

        await this.bot.sendMessage(message.key.remoteJid, {
            text: warningMessage,
            mentions: [userId]
        });

        // Delete the message if possible
        try {
            await this.bot.sendMessage(message.key.remoteJid, {
                delete: message.key
            });
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }

    async isGroupAdmin(message) {
        try {
            const groupMetadata = await this.bot.groupMetadata(message.key.remoteJid);
            const participant = message.key.participant || message.key.remoteJid;
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
            return admins.includes(participant);
        } catch {
            return false;
        }
    }
}

module.exports = AntiSpamHandler; 