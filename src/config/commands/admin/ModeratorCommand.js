const Command = require('../../../structures/Command');

class ModeratorCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'mod',
			description: 'Moderation commands for chat management',
			usage: '.mod <block|unblock|autoresponse|queue> [options]',
			aliases: ['moderate'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .mod <block|unblock|autoresponse|queue> [options]');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'block':
				return await this.handleBlock(message, args.slice(1));
			case 'unblock':
				return await this.handleUnblock(message, args.slice(1));
			case 'autoresponse':
			case 'ar':
				return await this.handleAutoResponse(message, args.slice(1));
			case 'queue':
				return await this.handleQueue(message, args.slice(1));
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: block, unblock, autoresponse, queue');
		}
	}

	async handleBlock(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .mod block <user_jid>');
		}
		await this.bot.blockUser(args[0]);
		return await this.bot.sendText(message.key.remoteJid, `Blocked user: ${args[0]}`);
	}

	async handleUnblock(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .mod unblock <user_jid>');
		}
		await this.bot.unblockUser(args[0]);
		return await this.bot.sendText(message.key.remoteJid, `Unblocked user: ${args[0]}`);
	}

	async handleAutoResponse(message, args) {
		if (args.length < 2) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .mod autoresponse <add|remove> <trigger> [response]');
		}

		const action = args[0].toLowerCase();
		const trigger = args[1];

		if (action === 'add') {
			if (args.length < 3) {
				return await this.bot.sendText(message.key.remoteJid, 'Please provide a response message');
			}
			const response = args.slice(2).join(' ');
			await this.bot.addAutoResponse(trigger, response);
			return await this.bot.sendText(message.key.remoteJid, `Added auto-response for: ${trigger}`);
		} else if (action === 'remove') {
			const removed = await this.bot.removeAutoResponse(trigger);
			return await this.bot.sendText(message.key.remoteJid, removed ? `Removed auto-response: ${trigger}` : `No auto-response found for: ${trigger}`);
		}
	}

	async handleQueue(message, args) {
		if (args.length < 3) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .mod queue <jid> <delay_ms> <message>');
		}

		const [jid, delay] = args;
		const content = { text: args.slice(2).join(' ') };
		await this.bot.queueMessage(jid, content, parseInt(delay));
		return await this.bot.sendText(message.key.remoteJid, `Message queued for ${jid} with ${delay}ms delay`);
	}
}

module.exports = ModeratorCommand;