const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AntibanProtection {
    constructor(bot) {
        this.bot = bot;
        this.messageQueue = new Map();
        this.cooldowns = new Map();
        this.autoResetInterval = 3600000; // 1 hour
        this.initAutoReset();
    }

    async protectMessage(message) {
        try {
            // Message protection
            await this.enforceMessageLimits(message);
            await this.sanitizeContent(message);
            await this.addMessageDelay(message);
            await this.validateMediaContent(message);
            await this.protectMetadata(message);
            
            // Advanced protection
            await this.rotateUserAgent();
            await this.validateConnection();
            await this.checkServerHealth();
            await this.backupSession();
        } catch (error) {
            console.error('Protection error:', error);
            return false;
        }
    }

    async enforceMessageLimits(message) {
        const userId = message.key.participant || message.key.remoteJid;
        
        // Advanced cooldown system
        if (this.isOnCooldown(userId)) {
            const remainingTime = this.getRemainingCooldown(userId);
            throw new Error(`Please wait ${remainingTime}s before sending another message`);
        }

        // Queue management with priorities
        await this.manageMessageQueue(userId, message.type);
        
        // Dynamic cooldown based on message type
        this.setDynamicCooldown(userId, message.type);
    }

    async sanitizeContent(message) {
        if (!message.message) return;

        // Text message sanitization
        if (message.message.conversation) {
            message.message.conversation = this.sanitizeText(message.message.conversation);
        }

        // Media caption sanitization
        if (message.message.imageMessage?.caption) {
            message.message.imageMessage.caption = this.sanitizeText(message.message.imageMessage.caption);
        }

        // Remove potentially harmful metadata
        if (message.message.imageMessage) {
            delete message.message.imageMessage.jpegThumbnail;
        }
    }

    sanitizeText(text) {
        return text
            .replace(/[^\w\s.,!?@#]/gi, '') // Remove special characters
            .slice(0, 1000); // Limit length
    }

    async validateMediaContent(message) {
        if (!message.message) return;

        // Check for media messages
        const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'];
        
        for (const type of mediaTypes) {
            if (message.message[type]) {
                await this.validateMedia(message.message[type], type);
            }
        }
    }

    async validateMedia(media, type) {
        // Size limits
        const limits = {
            imageMessage: 5 * 1024 * 1024, // 5MB
            videoMessage: 15 * 1024 * 1024, // 15MB
            audioMessage: 10 * 1024 * 1024, // 10MB
            stickerMessage: 1 * 1024 * 1024 // 1MB
        };

        if (media.fileLength > limits[type]) {
            throw new Error(`${type} size exceeds limit`);
        }

        // Validate media type
        const allowedMimes = {
            imageMessage: ['image/jpeg', 'image/png'],
            videoMessage: ['video/mp4'],
            audioMessage: ['audio/mp4', 'audio/mpeg'],
            stickerMessage: ['image/webp']
        };

        if (!allowedMimes[type].includes(media.mimetype)) {
            throw new Error(`Invalid ${type} format`);
        }
    }

    async protectMetadata(message) {
        // Remove sensitive metadata
        delete message.messageTimestamp;
        delete message.participant;
        
        // Add safety metadata
        message.securityVersion = '1.0.0';
        message.protectedBy = 'DinethMD';
        message.verificationHash = this.generateHash(message);
    }

    generateHash(message) {
        // Implement secure hash generation
        return require('crypto')
            .createHash('sha256')
            .update(JSON.stringify(message))
            .digest('hex');
    }

    async rotateUserAgent() {
        const userAgents = [
            'WhatsApp/2.22.24.81 Android',
            'WhatsApp/2.22.24.81 iOS',
            'WhatsApp/2.22.24.81 Web'
        ];
        this.bot.userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    async backupSession() {
        const backupDir = path.join(__dirname, '../../backups');
        await fs.mkdir(backupDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `session-${timestamp}.json`);
        
        await fs.writeFile(backupPath, JSON.stringify(this.bot.store.session));
    }

    initAutoReset() {
        setInterval(() => {
            this.messageQueue.clear();
            this.cooldowns.clear();
            console.log('Security counters reset');
        }, this.autoResetInterval);
    }

    // Helper methods
    isOnCooldown(userId) {
        return this.cooldowns.has(userId) && 
               Date.now() - this.cooldowns.get(userId).time < this.cooldowns.get(userId).duration;
    }

    getRemainingCooldown(userId) {
        const cooldown = this.cooldowns.get(userId);
        return Math.ceil((cooldown.time + cooldown.duration - Date.now()) / 1000);
    }

    setDynamicCooldown(userId, messageType) {
        const durations = {
            text: 1000,      // 1 second
            media: 3000,     // 3 seconds
            sticker: 2000,   // 2 seconds
            document: 5000   // 5 seconds
        };

        this.cooldowns.set(userId, {
            time: Date.now(),
            duration: durations[messageType] || 1000
        });
    }
}

module.exports = AntibanProtection; 