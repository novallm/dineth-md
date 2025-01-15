const Command = require('../../structures/Command');
const session = require('../../utils/SessionManager');

class MiniGamesCommand extends Command {
    constructor() {
        super({
            name: 'game',
            aliases: ['play', 'minigame'],
            description: 'Play mini games',
            category: 'fun'
        });

        this.games = {
            hangman: this.startHangman,
            wordle: this.startWordle,
            math: this.startMathGame,
            memory: this.startMemoryGame,
            riddle: this.startRiddle
        };
    }

    async execute(message, args) {
        const game = args[0]?.toLowerCase();

        if (!game || !this.games[game]) {
            return message.reply(`╭─❒ 『 MINI GAMES 』 ❒
│
├─❒ 🎮 *Available Games:*
│ • hangman - Guess the word
│ • wordle - Word puzzle
│ • math - Math challenge
│ • memory - Memory test
│ • riddle - Solve riddles
│
├─❒ 🏆 *Rewards:*
│ • XP points
│ • Virtual coins
│ • Special items
│
╰──────────────────❒`);
        }

        await this.games[game].call(this, message);
    }

    // Implement game methods...
}

module.exports = MiniGamesCommand; 