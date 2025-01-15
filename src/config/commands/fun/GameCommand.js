const Command = require('../../structures/Command');

class GameCommand extends Command {
    constructor() {
        super({
            name: 'game',
            aliases: ['games', 'play'],
            description: 'Play various games',
            category: 'fun'
        });
    }

    async execute(message, args) {
        const gameMenu = `╭─❒ 『 GAME CENTER 』 ❒
│
├─❒ 🎮 *SINGLE PLAYER*
│ • .slot - Slot Machine
│ • .math - Math Challenge
│ • .riddle - Solve Riddles
│ • .quiz - Knowledge Quiz
│ • .word - Word Game
│ • .typing - Speed Test
│
├─❒ 🎲 *MULTIPLAYER*
│ • .ttt - TicTacToe
│ • .chess - Play Chess
│ • .fight - Battle Friends
│ • .race - Car Racing
│ • .cards - Card Games
│
├─❒ 🎯 *CHALLENGES*
│ • .dare - Do a Dare
│ • .truth - Tell Truth
│ • .never - Never Have I Ever
│ • .would - Would You Rather
│
├─❒ 💰 *ECONOMY*
│ • .daily - Daily Reward
│ • .work - Earn Money
│ • .rob - Rob Friends
│ • .shop - Buy Items
│ • .inv - Inventory
╰──────────────────❒

🎮 *Active Games:* ${this.getActiveGames()}
👥 *Online Players:* ${this.getOnlinePlayers()}

Type .game <name> to start playing!`;

        await message.client.sendMessage(message.key.remoteJid, {
            image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/games.jpg' },
            caption: gameMenu,
            footer: '🎮 Dineth MD Games',
            buttons: [
                { buttonId: '.slot', buttonText: { displayText: '🎰 Play Slot' }, type: 1 },
                { buttonId: '.ttt', buttonText: { displayText: '⭕ TicTacToe' }, type: 1 }
            ]
        });
    }

    getActiveGames() {
        // Implement active games counter
        return '5 games';
    }

    getOnlinePlayers() {
        // Implement online players counter
        return '12 players';
    }
}

module.exports = GameCommand; 