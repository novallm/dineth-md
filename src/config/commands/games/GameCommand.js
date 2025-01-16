const Command = require('../../../structures/Command');

class GameCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'game',
			description: 'Play interactive WhatsApp games',
			usage: '.game <start|stop|list|leaderboard> [game type] [options]',
			aliases: ['play'],
			category: 'games'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .game <start|stop|list|leaderboard> [game type] [options]');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'start':
				return await this.handleStart(message, args.slice(1));
			case 'stop':
				return await this.handleStop(message);
			case 'list':
				return await this.handleList(message);
			case 'leaderboard':
				return await this.handleLeaderboard(message);
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: start, stop, list, leaderboard');
		}
	}

	async handleStart(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .game start <game type> [options]\nAvailable games: quiz, wordchain, riddle, mathbattle, trivia');
		}

		const gameType = args[0].toLowerCase();
		const options = this.parseGameOptions(args.slice(1));

		try {
			const startMessage = await this.bot.gameHandler.startGame(
				message.key.remoteJid,
				gameType,
				options
			);
			return await this.bot.sendText(message.key.remoteJid, startMessage);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Failed to start game: ${error.message}`);
		}
	}

	async handleStop(message) {
		const game = this.bot.gameHandler.activeGames.get(message.key.remoteJid);
		if (!game) {
			return await this.bot.sendText(message.key.remoteJid, 'No active game in this chat');
		}

		const endMessage = await game.endGame();
		this.bot.gameHandler.activeGames.delete(message.key.remoteJid);
		return await this.bot.sendText(message.key.remoteJid, endMessage);
	}

	async handleList(message) {
		const games = Object.keys(this.bot.gameHandler.games);
		const gameList = games.map(game => `• ${game}`).join('\n');
		return await this.bot.sendText(
			message.key.remoteJid,
			`Available Games:\n${gameList}\n\nUse .game start <game> to begin playing!`
		);
	}

	async handleLeaderboard(message) {
		const leaderboard = this.bot.gameHandler.getGameLeaderboard(message.key.remoteJid);
		return await this.bot.sendText(
			message.key.remoteJid,
			`🏆 Game Leaderboard 🏆\n\n${leaderboard}`
		);
	}

	parseGameOptions(args) {
		const options = {};
		for (const arg of args) {
			const [key, value] = arg.split(':');
			if (key && value) {
				options[key] = isNaN(value) ? value : Number(value);
			}
		}
		return options;
	}
}

module.exports = GameCommand;