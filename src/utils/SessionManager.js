const { Storage } = require('megajs');
const fs = require('fs').promises;
const path = require('path');

class SessionManager {
    constructor() {
        this.storage = new Storage({
            email: process.env.MEGA_EMAIL,
            password: process.env.MEGA_PASSWORD
        });
        this.sessionPath = path.join(__dirname, '../../temp/session.json');
        this.data = {};
        this.autoSaveInterval = 5 * 60 * 1000; // 5 minutes
    }

    async init() {
        try {
            await this.storage.ready;
            await this.loadSession();
            this.startAutoSave();
        } catch (error) {
            console.error('Session manager init error:', error);
        }
    }

    async loadSession() {
        try {
            const file = await this.storage.findFile('session.json');
            if (file) {
                const buffer = await file.downloadBuffer();
                this.data = JSON.parse(buffer.toString());
            }
        } catch (error) {
            console.error('Session load error:', error);
            // Create new session if none exists
            this.data = {
                users: {},
                groups: {},
                games: {},
                economy: {},
                levels: {},
                lastUpdate: Date.now()
            };
        }
    }

    async saveSession() {
        try {
            this.data.lastUpdate = Date.now();
            const jsonData = JSON.stringify(this.data, null, 2);
            await fs.writeFile(this.sessionPath, jsonData);

            // Upload to MEGA
            const file = await this.storage.findFile('session.json');
            if (file) {
                await file.delete();
            }
            await this.storage.upload('session.json', Buffer.from(jsonData)).complete;
        } catch (error) {
            console.error('Session save error:', error);
        }
    }

    startAutoSave() {
        setInterval(() => this.saveSession(), this.autoSaveInterval);
    }

    // Session data management methods
    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                xp: 0,
                level: 1,
                money: 0,
                inventory: [],
                achievements: [],
                lastDaily: null,
                warnings: 0,
                settings: {}
            };
        }
        return this.data.users[userId];
    }

    getGroup(groupId) {
        if (!this.data.groups[groupId]) {
            this.data.groups[groupId] = {
                settings: {},
                welcome: {},
                antiSpam: {},
                members: {},
                games: {}
            };
        }
        return this.data.groups[groupId];
    }
}

module.exports = new SessionManager(); 