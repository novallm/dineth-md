const axios = require('axios');
const semver = require('semver');
const fs = require('fs').promises;
const path = require('path');

class VersionHandler {
    constructor(bot) {
        this.bot = bot;
        this.currentVersion = '1.0.0';
        this.updateChannel = 'stable'; // stable, beta, dev
        this.updateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.updateHistory = [];
        this.initializeHandler();
    }

    async initializeHandler() {
        await this.loadUpdateHistory();
        this.startAutoUpdateCheck();
    }

    async checkForUpdates() {
        try {
            const response = await axios.get('https://api.github.com/repos/yourusername/dineth-md-v1/releases/latest');
            const latestVersion = response.data.tag_name;

            if (semver.gt(latestVersion, this.currentVersion)) {
                await this.notifyUpdate(latestVersion);
                return {
                    hasUpdate: true,
                    currentVersion: this.currentVersion,
                    latestVersion: latestVersion,
                    changelog: response.data.body
                };
            }

            return { hasUpdate: false };
        } catch (error) {
            console.error('Update check failed:', error);
            return { hasUpdate: false, error: error.message };
        }
    }

    async notifyUpdate(newVersion) {
        const updateMessage = `🔄 *New Update Available!*\n\n` +
                            `Current Version: ${this.currentVersion}\n` +
                            `Latest Version: ${newVersion}\n\n` +
                            `Type .update to update the bot`;

        await this.bot.sendMessage(this.bot.config.ownerNumber + '@s.whatsapp.net', {
            text: updateMessage
        });
    }

    async performUpdate() {
        try {
            // Backup current version
            await this.backupCurrentVersion();

            // Download and apply update
            await this.downloadUpdate();
            await this.applyUpdate();

            // Log update
            await this.logUpdate();

            return { success: true, message: 'Update completed successfully' };
        } catch (error) {
            console.error('Update failed:', error);
            return { success: false, error: error.message };
        }
    }

    async backupCurrentVersion() {
        const backupDir = path.join(__dirname, '../../backups');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await fs.mkdir(backupDir, { recursive: true });
        
        // Create backup
        await fs.cp(
            path.join(__dirname, '../..'),
            path.join(backupDir, `backup_${timestamp}`),
            { recursive: true }
        );
    }

    async loadUpdateHistory() {
        try {
            const historyFile = path.join(__dirname, '../../data/update_history.json');
            const history = await fs.readFile(historyFile, 'utf8');
            this.updateHistory = JSON.parse(history);
        } catch (error) {
            this.updateHistory = [];
        }
    }

    async logUpdate() {
        const updateLog = {
            timestamp: new Date().toISOString(),
            fromVersion: this.currentVersion,
            toVersion: await this.getLatestVersion(),
            status: 'success'
        };

        this.updateHistory.push(updateLog);
        await this.saveUpdateHistory();
    }

    async saveUpdateHistory() {
        const historyFile = path.join(__dirname, '../../data/update_history.json');
        await fs.writeFile(historyFile, JSON.stringify(this.updateHistory, null, 2));
    }

    startAutoUpdateCheck() {
        setInterval(async () => {
            await this.checkForUpdates();
        }, this.updateCheckInterval);
    }

    async setUpdateChannel(channel) {
        if (['stable', 'beta', 'dev'].includes(channel)) {
            this.updateChannel = channel;
            return true;
        }
        return false;
    }

    getUpdateHistory() {
        return this.updateHistory;
    }

    async rollbackUpdate(version) {
        // Implement rollback logic
        const backupDir = path.join(__dirname, '../../backups');
        const backups = await fs.readdir(backupDir);
        const targetBackup = backups.find(b => b.includes(version));

        if (targetBackup) {
            // Perform rollback
            await fs.cp(
                path.join(backupDir, targetBackup),
                path.join(__dirname, '../..'),
                { recursive: true }
            );
            return true;
        }
        return false;
    }
}

module.exports = VersionHandler; 