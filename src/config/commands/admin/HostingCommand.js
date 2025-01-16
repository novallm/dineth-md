const Command = require('../../../structures/Command');

class HostingCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'hosting',
			description: 'Manage TalkDrove hosting settings',
			usage: '.hosting <init|status|sync|config>',
			aliases: ['host'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .hosting <init|status|sync|config>');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'init':
				return await this.handleInit(message, args[1]);
			case 'status':
				return await this.handleStatus(message);
			case 'sync':
				return await this.handleSync(message);
			case 'config':
				return await this.handleConfig(message, args.slice(1));
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: init, status, sync, config');
		}
	}

	async handleInit(message, apiKey) {
		if (!apiKey) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .hosting init <apiKey>');
		}

		try {
			const result = await this.bot.talkDroveHandler.initializeHosting(apiKey);
			return await this.bot.sendText(
				message.key.remoteJid,
				`Bot successfully hosted on TalkDrove!\nInstance ID: ${result.instanceId}\nStatus: Active`
			);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Failed to initialize hosting: ${error.message}`);
		}
	}

	async handleStatus(message) {
		const status = this.bot.talkDroveHandler.getHostingStatus();
		const response = `Hosting Status:\n` +
			`Hosted: ${status.isHosted ? 'Yes' : 'No'}\n` +
			`Instance ID: ${status.instanceId || 'N/A'}\n` +
			`WebSocket: ${status.wsStatus}\n` +
			`Last Sync: ${status.lastSync ? status.lastSync.toLocaleString() : 'Never'}\n` +
			`Active Metrics: ${status.metrics.size}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async handleSync(message) {
		try {
			await this.bot.talkDroveHandler.syncData();
			return await this.bot.sendText(message.key.remoteJid, 'Data synchronized with TalkDrove successfully');
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Sync failed: ${error.message}`);
		}
	}

	async handleConfig(message, args) {
		if (args.length < 2) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .hosting config <key> <value>');
		}

		const [key, ...valueParts] = args;
		const value = valueParts.join(' ');

		try {
			await this.bot.talkDroveHandler.updateConfig({ [key]: value });
			return await this.bot.sendText(message.key.remoteJid, `Configuration updated: ${key} = ${value}`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Failed to update config: ${error.message}`);
		}
	}
}

module.exports = HostingCommand;