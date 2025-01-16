const Command = require('../../../structures/Command');

class AdminCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'admin',
			description: 'Admin commands for bot management',
			usage: '.admin <broadcast|schedule|stats> [options]',
			aliases: ['adm'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .admin <broadcast|schedule|stats> [options]');
		}

		const subCommand = args[0].toLowerCase();

		switch (subCommand) {
			case 'broadcast':
				return await this.handleBroadcast(message, args.slice(1));
			case 'schedule':
				return await this.handleSchedule(message, args.slice(1));
			case 'stats':
				return await this.handleStats(message, args.slice(1));
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: broadcast, schedule, stats');
		}
	}

	async handleBroadcast(message, args) {
		if (args.length < 2) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .admin broadcast <numbers/groups> <message>');
		}

		const targets = args[0].split(',');
		const content = { text: args.slice(1).join(' ') };

		if (targets[0].endsWith('@g.us')) {
			const results = await this.bot.broadcastToGroups(targets, content);
			return await this.bot.sendText(message.key.remoteJid, `Broadcast results:\n${JSON.stringify(results, null, 2)}`);
		} else {
			const results = await this.bot.broadcastMessage(targets, content);
			return await this.bot.sendText(message.key.remoteJid, `Broadcast results:\n${JSON.stringify(results, null, 2)}`);
		}
	}

	async handleSchedule(message, args) {
		if (args.length < 3) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .admin schedule <jid> <cron> <message>');
		}

		const [jid, cronExpression] = args;
		const content = { text: args.slice(2).join(' ') };

		const taskId = this.bot.scheduleHandler.scheduleMessage(jid, content, cronExpression);
		return await this.bot.sendText(message.key.remoteJid, `Scheduled message with ID: ${taskId}`);
	}

	async handleStats(message, args) {
		const jid = args[0] || message.key.remoteJid;
		const stats = this.bot.getUserStats(jid);
		const response = `Stats for ${jid}:\n` +
			`Messages: ${stats.messageCount}\n` +
			`Commands: ${stats.commandCount}\n` +
			`Last Active: ${stats.lastActive?.toLocaleString() || 'Never'}`;
		
		return await this.bot.sendText(message.key.remoteJid, response);
	}
}

module.exports = AdminCommand;