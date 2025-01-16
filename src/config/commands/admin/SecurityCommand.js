const Command = require('../../../structures/Command');

class SecurityCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'security',
			description: 'Manage security settings and trusted devices',
			usage: '.security <trust|block|mode|status>',
			aliases: ['sec'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .security <trust|block|mode|status>');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'trust':
				return await this.handleTrust(message, args.slice(1));
			case 'block':
				return await this.handleBlock(message, args.slice(1));
			case 'mode':
				return await this.handleMode(message, args.slice(1));
			case 'status':
				return await this.handleStatus(message);
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: trust, block, mode, status');
		}
	}

	async handleTrust(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .security trust <deviceId> [description]');
		}

		const [deviceId, ...descParts] = args;
		const description = descParts.join(' ') || 'Trusted device';

		this.bot.securityHandler.addTrustedDevice(deviceId, {
			description,
			trustedBy: message.key.remoteJid,
			trustedAt: new Date()
		});

		return await this.bot.sendText(
			message.key.remoteJid,
			`Device ${deviceId} added to trusted devices list`
		);
	}

	async handleBlock(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .security block <deviceId>');
		}

		const deviceId = args[0];
		const wasBlocked = this.bot.securityHandler.isBlocked(deviceId);
		
		if (!wasBlocked) {
			this.bot.securityHandler.updateLoginAttempts(deviceId);
			this.bot.securityHandler.updateLoginAttempts(deviceId);
			this.bot.securityHandler.updateLoginAttempts(deviceId);
		}

		return await this.bot.sendText(
			message.key.remoteJid,
			`Device ${deviceId} is now ${wasBlocked ? 'already' : 'newly'} blocked`
		);
	}

	async handleMode(message, args) {
		if (!args.length) {
			return await this.bot.sendText(
				message.key.remoteJid,
				`Current security mode: ${this.bot.secureMode ? 'Secure' : 'Standard'}`
			);
		}

		const mode = args[0].toLowerCase();
		if (mode === 'secure' || mode === 'standard') {
			this.bot.secureMode = mode === 'secure';
			return await this.bot.sendText(
				message.key.remoteJid,
				`Security mode changed to: ${mode}`
			);
		}

		return await this.bot.sendText(message.key.remoteJid, 'Invalid mode. Use: secure or standard');
	}

	async handleStatus(message) {
		const trustedCount = this.bot.securityHandler.trustedDevices.size;
		const blockedCount = Array.from(this.bot.securityHandler.loginAttempts.entries())
			.filter(([_, attempts]) => attempts >= this.bot.securityHandler.maxLoginAttempts)
			.length;

		const response = `Security Status:\n` +
			`Mode: ${this.bot.secureMode ? 'Secure' : 'Standard'}\n` +
			`Trusted Devices: ${trustedCount}\n` +
			`Blocked Devices: ${blockedCount}\n` +
			`Max Login Attempts: ${this.bot.securityHandler.maxLoginAttempts}\n` +
			`Encryption: Active`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}
}

module.exports = SecurityCommand;