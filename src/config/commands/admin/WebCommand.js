const Command = require('../../../structures/Command');

class WebCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'web',
			description: 'Manage web sessions and remote control',
			usage: '.web <session|metrics|status>',
			aliases: ['remote'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .web <session|metrics|status>');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'session':
				return await this.handleSession(message, args.slice(1));
			case 'metrics':
				return await this.handleMetrics(message);
			case 'status':
				return await this.handleStatus(message);
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: session, metrics, status');
		}
	}

	async handleSession(message, args) {
		if (!args.length) {
			const session = await this.bot.sessionHandler.createSession();
			return await this.bot.sendText(
				message.key.remoteJid,
				`New web session created!\nSession ID: ${session.id}\nStatus: ${session.status}\nUse this ID to connect at dinethmd.netlify.app`
			);
		}

		const [action, sessionId] = args;
		if (action === 'close' && sessionId) {
			const closed = await this.bot.sessionHandler.closeSession(sessionId);
			return await this.bot.sendText(
				message.key.remoteJid,
				closed ? `Session ${sessionId} closed` : `Session ${sessionId} not found`
			);
		}

		if (action === 'info' && sessionId) {
			const info = this.bot.sessionHandler.getSessionInfo(sessionId);
			if (!info) {
				return await this.bot.sendText(message.key.remoteJid, `Session ${sessionId} not found`);
			}
			return await this.bot.sendText(
				message.key.remoteJid,
				`Session Info:\nID: ${info.id}\nStatus: ${info.status}\nCreated: ${info.created}\nDevice: ${info.connectionInfo.device}`
			);
		}
	}

	async handleMetrics(message) {
		const metrics = this.bot.getMetrics();
		const uptime = Math.floor(metrics.uptime / 1000 / 60); // minutes
		const memory = Math.floor(metrics.memoryUsage / 1024 / 1024); // MB

		const response = `Bot Metrics:\n` +
			`Uptime: ${uptime} minutes\n` +
			`Memory Usage: ${memory}MB\n` +
			`Active Chats: ${metrics.activeChats.length}\n` +
			`Messages Processed: ${metrics.messageCount}\n` +
			`Commands Executed: ${metrics.commandCount}\n` +
			`Command Success Rate: ${(metrics.commandSuccess / (metrics.commandSuccess + metrics.commandFailed) * 100).toFixed(2)}%`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async handleStatus(message) {
		const status = {
			websocket: this.bot.sessionHandler.websocket?.readyState === 1 ? 'Connected' : 'Disconnected',
			activeSessions: this.bot.sessionHandler.sessions.size,
			reconnectAttempts: this.bot.sessionHandler.reconnectAttempts
		};

		const response = `Web Status:\n` +
			`WebSocket: ${status.websocket}\n` +
			`Active Sessions: ${status.activeSessions}\n` +
			`Reconnect Attempts: ${status.reconnectAttempts}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}
}

module.exports = WebCommand;