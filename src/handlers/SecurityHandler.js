const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class SecurityHandler {
    constructor() {
        this.rateLimits = new Map();
        this.blacklist = new Set();
        this.securityRules = new Map();
        this.encryptionKey = crypto.randomBytes(32);
        this.initializeSecurityRules();
    }

    initializeSecurityRules() {
        this.securityRules.set('message', {
            rateLimit: 30,
            timeWindow: 60000,
            maxLength: 4096
        });
        
        this.securityRules.set('media', {
            rateLimit: 10,
            timeWindow: 60000,
            maxSize: 16 * 1024 * 1024
        });
        
        this.securityRules.set('group', {
            rateLimit: 5,
            timeWindow: 300000,
            maxMembers: 256
        });
    }

    async validateMessage(message) {
        const checks = await Promise.all([
            this.checkRateLimit(message.sender, 'message'),
            this.validateContent(message),
            this.checkBlacklist(message.sender),
            this.scanForThreats(message)
        ]);

        return {
            valid: checks.every(check => check.valid),
            violations: checks.filter(check => !check.valid).map(check => check.reason)
        };
    }

    async checkRateLimit(userId, type) {
        const rule = this.securityRules.get(type);
        if (!rule) return { valid: true };

        const key = `${userId}:${type}`;
        const history = this.rateLimits.get(key) || [];
        const now = Date.now();

        // Clean old entries
        const recentHistory = history.filter(time => now - time < rule.timeWindow);

        if (recentHistory.length >= rule.rateLimit) {
            return {
                valid: false,
                reason: `Rate limit exceeded for ${type}`
            };
        }

        recentHistory.push(now);
        this.rateLimits.set(key, recentHistory);
        return { valid: true };
    }

    async validateContent(message) {
        const rule = this.securityRules.get('message');
        
        if (message.content.length > rule.maxLength) {
            return {
                valid: false,
                reason: 'Message exceeds maximum length'
            };
        }

        return { valid: true };
    }

    async checkBlacklist(userId) {
        return {
            valid: !this.blacklist.has(userId),
            reason: this.blacklist.has(userId) ? 'User is blacklisted' : null
        };
    }

    async scanForThreats(message) {
        const threats = await this.detectThreats(message);
        return {
            valid: threats.length === 0,
            reason: threats.length > 0 ? `Detected threats: ${threats.join(', ')}` : null
        };
    }

    async detectThreats(message) {
        const threats = [];
        
        // Check for malicious links
        if (this.containsMaliciousLinks(message.content)) {
            threats.push('malicious_link');
        }
        
        // Check for suspicious patterns
        if (this.hasSuspiciousPatterns(message.content)) {
            threats.push('suspicious_pattern');
        }
        
        // Check for potential phishing attempts
        if (await this.isPhishingAttempt(message.content)) {
            threats.push('phishing_attempt');
        }

        return threats;
    }

    containsMaliciousLinks(content) {
        const maliciousPatterns = [
            /bit\.ly/i,
            /goo\.gl/i,
            /tinyurl\.com/i
        ];
        
        return maliciousPatterns.some(pattern => pattern.test(content));
    }

    hasSuspiciousPatterns(content) {
        const suspiciousPatterns = [
            /\b(password|credit card|ssn)\b/i,
            /\b(hack|crack|exploit)\b/i,
            /\b(free.*money|make.*money)\b/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(content));
    }

    async isPhishingAttempt(content) {
        const phishingIndicators = [
            /urgent.*action required/i,
            /verify.*account.*immediately/i,
            /login.*credentials/i
        ];
        
        return phishingIndicators.some(pattern => pattern.test(content));
    }

    generateToken(userId, permissions = []) {
        return jwt.sign(
            { userId, permissions },
            this.encryptionKey.toString('hex'),
            { expiresIn: '24h' }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.encryptionKey.toString('hex'));
        } catch (error) {
            return null;
        }
    }

    encryptMessage(message) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            this.encryptionKey,
            iv
        );
        
        let encrypted = cipher.update(message, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: cipher.getAuthTag().toString('hex')
        };
    }

    decryptMessage(encryptedData) {
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            this.encryptionKey,
            Buffer.from(encryptedData.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    addToBlacklist(userId) {
        this.blacklist.add(userId);
    }

    removeFromBlacklist(userId) {
        this.blacklist.delete(userId);
    }

    updateSecurityRule(type, updates) {
        const currentRule = this.securityRules.get(type);
        if (currentRule) {
            this.securityRules.set(type, { ...currentRule, ...updates });
        }
    }

    clearRateLimits(userId) {
        for (const [key] of this.rateLimits.entries()) {
            if (key.startsWith(userId)) {
                this.rateLimits.delete(key);
            }
        }
    }
}

module.exports = SecurityHandler;
