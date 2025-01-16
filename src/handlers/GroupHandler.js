const crypto = require('crypto');

class GroupHandler {
	constructor(bot) {
		this.bot = bot;
		this.groupSettings = new Map();
		this.welcomeMessages = new Map();
		this.antiSpamSettings = new Map();
		this.groupStats = new Map();
		this.initializeDefaults();
	}

	async initializeDefaults() {
		this.defaultSettings = {
			antiSpam: true,
			antiLink: true,
			antiToxic: true,
			maxWarnings: 3,
			autoMute: false,
			welcomeMessage: true,
			memberTracking: true,
			languageFilter: true,
			botCommands: true
		};
	}

	async createGroup(name, participants) {
		try {
			const group = await this.bot.sock.groupCreate(name, participants);
			await this.setupNewGroup(group.id);
			return group;
		} catch (error) {
			throw new Error(`Failed to create group: ${error.message}`);
		}
	}

	async setupNewGroup(groupId) {
		this.groupSettings.set(groupId, { ...this.defaultSettings });
		await this.updateGroupMetadata(groupId);
		await this.initializeGroupStats(groupId);
	}

	async updateGroupMetadata(groupId) {
		const metadata = await this.bot.sock.groupMetadata(groupId);
		this.groupStats.set(groupId, {
			created: metadata.creation,
			participants: metadata.participants.length,
			description: metadata.desc,
			lastActivity: Date.now()
		});
	}

	async handleGroupMessage(message) {
		const groupId = message.key.remoteJid;
		const settings = this.groupSettings.get(groupId);
		
		if (!settings) {
			await this.setupNewGroup(groupId);
			return;
		}

		await this.updateGroupActivity(groupId);
		await this.processGroupRules(message, settings);
		await this.updateGroupStats(groupId, message);
	}

	async processGroupRules(message, settings) {
		const violations = await this.checkViolations(message, settings);
		if (violations.length > 0) {
			await this.handleViolations(message, violations);
		}
	}

	async checkViolations(message, settings) {
		const violations = [];
		
		if (settings.antiSpam && await this.isSpam(message)) {
			violations.push('spam');
		}
		
		if (settings.antiLink && this.containsLinks(message)) {
			violations.push('links');
		}
		
		if (settings.antiToxic && await this.isToxic(message)) {
			violations.push('toxic');
		}

		return violations;
	}

	async handleViolations(message, violations) {
		const sender = message.key.participant;
		const warnings = await this.incrementWarnings(sender);
		
		if (warnings >= this.defaultSettings.maxWarnings) {
			await this.removeParticipant(message.key.remoteJid, sender);
		} else {
			await this.sendWarning(message.key.remoteJid, sender, violations);
		}
	}

	async addParticipants(groupId, participants) {
		try {
			await this.bot.sock.groupParticipantsUpdate(
				groupId,
				participants,
				"add"
			);
			
			if (this.welcomeMessages.has(groupId)) {
				await this.sendWelcomeMessage(groupId, participants);
			}
		} catch (error) {
			throw new Error(`Failed to add participants: ${error.message}`);
		}
	}

	async removeParticipant(groupId, participant) {
		try {
			await this.bot.sock.groupParticipantsUpdate(
				groupId,
				[participant],
				"remove"
			);
			this.updateGroupStats(groupId);
		} catch (error) {
			throw new Error(`Failed to remove participant: ${error.message}`);
		}
	}

	async promoteParticipants(groupId, participants) {
		try {
			await this.bot.sock.groupParticipantsUpdate(
				groupId,
				participants,
				"promote"
			);
		} catch (error) {
			throw new Error(`Failed to promote participants: ${error.message}`);
		}
	}

	async updateGroupSettings(groupId, newSettings) {
		const currentSettings = this.groupSettings.get(groupId);
		this.groupSettings.set(groupId, {
			...currentSettings,
			...newSettings
		});
	}

	async setWelcomeMessage(groupId, message) {
		this.welcomeMessages.set(groupId, message);
	}

	async sendWelcomeMessage(groupId, participants) {
		const message = this.welcomeMessages.get(groupId);
		if (message) {
			const formatted = message.replace(
				'{participants}',
				participants.map(p => `@${p.split('@')[0]}`).join(', ')
			);
			await this.bot.sock.sendMessage(groupId, { text: formatted });
		}
	}

	async isSpam(message) {
		const sender = message.key.participant;
		const groupId = message.key.remoteJid;
		const key = `${groupId}:${sender}`;
		
		const history = this.antiSpamSettings.get(key) || [];
		const now = Date.now();
		const recentMessages = history.filter(time => now - time < 60000);
		
		if (recentMessages.length >= 5) {
			return true;
		}
		
		recentMessages.push(now);
		this.antiSpamSettings.set(key, recentMessages);
		return false;
	}

	containsLinks(message) {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return urlRegex.test(message.message?.conversation || '');
	}

	async isToxic(message) {
		const text = message.message?.conversation || '';
		const toxicWords = ['spam', 'scam', 'inappropriate']; // Expand this list
		return toxicWords.some(word => text.toLowerCase().includes(word));
	}

	async incrementWarnings(participant) {
		const warnings = this.groupStats.get(participant)?.warnings || 0;
		this.groupStats.set(participant, {
			...this.groupStats.get(participant),
			warnings: warnings + 1
		});
		return warnings + 1;
	}

	async sendWarning(groupId, participant, violations) {
		const warning = `⚠️ Warning @${participant.split('@')[0]}\nViolations: ${violations.join(', ')}`;
		await this.bot.sock.sendMessage(groupId, { text: warning });
	}

	async updateGroupStats(groupId, message = null) {
		const stats = this.groupStats.get(groupId) || {};
		if (message) {
			stats.messageCount = (stats.messageCount || 0) + 1;
			stats.lastMessage = Date.now();
		}
		stats.lastUpdate = Date.now();
		this.groupStats.set(groupId, stats);
	}

	async updateGroupActivity(groupId) {
		const stats = this.groupStats.get(groupId);
		if (stats) {
			stats.lastActivity = Date.now();
			this.groupStats.set(groupId, stats);
		}
	}

	async getGroupStats(groupId) {
		return this.groupStats.get(groupId) || null;
	}

	async cleanupInactiveGroups(threshold = 30 * 24 * 60 * 60 * 1000) { // 30 days
		const now = Date.now();
		for (const [groupId, stats] of this.groupStats.entries()) {
			if (now - stats.lastActivity > threshold) {
				await this.bot.sock.groupLeave(groupId);
				this.groupStats.delete(groupId);
				this.groupSettings.delete(groupId);
			}
		}
	}
}

module.exports = GroupHandler;