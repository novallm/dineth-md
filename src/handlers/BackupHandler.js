const fs = require('fs').promises;
const path = require('path');

class BackupHandler {
	constructor(bot) {
		this.bot = bot;
		this.backupPath = path.join(process.cwd(), 'backups');
		this.backupInterval = 3600000; // 1 hour
		this.maxBackupAge = 7 * 24 * 60 * 60 * 1000; // 7 days
		this.initialize();
	}

	async initialize() {
		await this.ensureBackupDirectory();
		this.startAutoBackup();
	}

	async ensureBackupDirectory() {
		try {
			await fs.mkdir(this.backupPath, { recursive: true });
		} catch (error) {
			console.error('Failed to create backup directory:', error);
		}
	}

	async saveBackup() {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupFile = path.join(this.backupPath, `backup-${timestamp}.json`);
		
		const backupData = {
			messages: Object.fromEntries(this.bot.messageBackups),
			stats: Object.fromEntries(this.bot.userStats),
			autoResponses: Object.fromEntries(this.bot.autoResponses),
			blockedUsers: Array.from(this.bot.blockedUsers),
			timestamp: new Date().toISOString()
		};

		try {
			await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
			await this.cleanOldBackups();
			return backupFile;
		} catch (error) {
			console.error('Backup failed:', error);
			throw error;
		}
	}

	async loadBackup(backupFile) {
		try {
			const data = JSON.parse(await fs.readFile(backupFile, 'utf8'));
			this.bot.messageBackups = new Map(Object.entries(data.messages));
			this.bot.userStats = new Map(Object.entries(data.stats));
			this.bot.autoResponses = new Map(Object.entries(data.autoResponses));
			this.bot.blockedUsers = new Set(data.blockedUsers);
			return true;
		} catch (error) {
			console.error('Failed to load backup:', error);
			return false;
		}
	}

	async cleanOldBackups() {
		const files = await fs.readdir(this.backupPath);
		const now = Date.now();

		for (const file of files) {
			const filePath = path.join(this.backupPath, file);
			const stats = await fs.stat(filePath);

			if (now - stats.mtime.getTime() > this.maxBackupAge) {
				await fs.unlink(filePath);
			}
		}
	}

	startAutoBackup() {
		setInterval(() => this.saveBackup(), this.backupInterval);
	}

	async getLatestBackup() {
		try {
			const files = await fs.readdir(this.backupPath);
			if (!files.length) return null;

			const latest = files
				.filter(f => f.startsWith('backup-'))
				.sort()
				.pop();

			return latest ? path.join(this.backupPath, latest) : null;
		} catch (error) {
			console.error('Failed to get latest backup:', error);
			return null;
		}
	}
}

module.exports = BackupHandler;