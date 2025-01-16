const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SessionHandler {
	constructor(bot) {
		this.bot = bot;
		this.sessions = new Map();
		this.sessionPath = path.join(__dirname, '../../sessions');
		this.initializeHandler();
	}

	async initializeHandler() {
		await fs.mkdir(this.sessionPath, { recursive: true });
		await this.loadSessions();
		this.startAutoSave();
	}

	generateSessionId() {
		return 'session_' + crypto.randomBytes(16).toString('hex');
	}

	async createSession(userId) {
		const sessionId = this.generateSessionId();
		const session = {
			id: sessionId,
			userId: userId,
			createdAt: Date.now(),
			lastActive: Date.now(),
			commands: [],
			settings: {},
			state: 'active',
			metadata: {
				device: {},
				location: {},
				preferences: {}
			}
		};

		this.sessions.set(sessionId, session);
		await this.saveSession(sessionId);
		return sessionId;
	}

	async loadSessions() {
		try {
			const files = await fs.readdir(this.sessionPath);
			for (const file of files) {
				if (file.endsWith('.json')) {
					const sessionData = JSON.parse(
						await fs.readFile(path.join(this.sessionPath, file), 'utf8')
					);
					this.sessions.set(sessionData.id, sessionData);
				}
			}
		} catch (error) {
			console.error('Error loading sessions:', error);
		}
	}

	async saveSession(sessionId) {
		const session = this.sessions.get(sessionId);
		if (session) {
			await fs.writeFile(
				path.join(this.sessionPath, `${sessionId}.json`),
				JSON.stringify(session, null, 2)
			);
		}
	}

	async updateSession(sessionId, updates) {
		const session = this.sessions.get(sessionId);
		if (session) {
			Object.assign(session, updates);
			session.lastActive = Date.now();
			await this.saveSession(sessionId);
		}
	}

	getSession(sessionId) {
		return this.sessions.get(sessionId);
	}

	async deleteSession(sessionId) {
		this.sessions.delete(sessionId);
		try {
			await fs.unlink(path.join(this.sessionPath, `${sessionId}.json`));
		} catch (error) {
			console.error('Error deleting session file:', error);
		}
	}

	startAutoSave() {
		setInterval(async () => {
			for (const [sessionId] of this.sessions) {
				await this.saveSession(sessionId);
			}
		}, 5 * 60 * 1000); // Auto-save every 5 minutes
	}

	// Advanced session management features
	async getActiveUserSessions(userId) {
		return Array.from(this.sessions.values())
			.filter(session => session.userId === userId && session.state === 'active');
	}

	async cleanupInactiveSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
		const now = Date.now();
		for (const [sessionId, session] of this.sessions) {
			if (now - session.lastActive > maxAge) {
				await this.deleteSession(sessionId);
			}
		}
	}

	async backupSessions() {
		const backupPath = path.join(this.sessionPath, 'backups');
		await fs.mkdir(backupPath, { recursive: true });
		
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupFile = path.join(backupPath, `sessions_backup_${timestamp}.json`);
		
		await fs.writeFile(
			backupFile,
			JSON.stringify(Object.fromEntries(this.sessions), null, 2)
		);
		
		return backupFile;
	}
}

module.exports = SessionHandler;