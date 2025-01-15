const Command = require('../../structures/Command');
const session = require('../../utils/SessionManager');

class WordGamesCommand extends Command {
    constructor() {
        super({
            name: 'word',
            aliases: ['wordgame', 'words'],
            description: 'Play word games',
            category: 'games'
        });

        this.games = {
            scramble: {
                name: 'Word Scramble',
                description: 'Unscramble the letters'
            },
            chain: {
                name: 'Word Chain',
                description: 'Continue the word chain'
            },
            complete: {
                name: 'Word Complete',
                description: 'Complete the missing letters'
            },
            synonym: {
                name: 'Synonym Game',
                description: 'Find the synonym'
            },
            riddle: {
                name: 'Word Riddles',
                description: 'Solve word riddles'
            }
        };

        this.words = require('../../data/wordlist.json');
    }

    async execute(message, args) {
        const gameType = args[0]?.toLowerCase();
        const groupId = message.key.remoteJid;
        const groupSession = session.getGroup(groupId);

        if (!gameType || !this.games[gameType]) {
            return message.reply(`╭─❒ 『 WORD GAMES 』 ❒
│
├─❒ 📚 *Available Games:*
${Object.entries(this.games).map(([id, game]) => 
`│ • ${id} - ${game.name}
│   ${game.description}`).join('\n')}
│
├─❒ 🎮 *How to Play:*
│ .word <game> start
│
├─❒ 🏆 *Rewards:*
│ • XP: 100-500
│ • Coins: 50-200
│ • Special items
│
╰──────────────────❒`);
        }

        if (groupSession.games?.word?.active) {
            return message.reply('❌ A word game is already active in this group!');
        }

        switch(gameType) {
            case 'scramble':
                await this.startScramble(message);
                break;
            case 'chain':
                await this.startWordChain(message);
                break;
            case 'complete':
                await this.startWordComplete(message);
                break;
            case 'synonym':
                await this.startSynonymGame(message);
                break;
            case 'riddle':
                await this.startWordRiddle(message);
                break;
        }
    }

    async startScramble(message) {
        const word = this.getRandomWord();
        const scrambled = this.scrambleWord(word);
        
        const groupSession = session.getGroup(message.key.remoteJid);
        groupSession.games.word = {
            active: true,
            type: 'scramble',
            word: word,
            startTime: Date.now(),
            attempts: 0,
            hints: 0
        };

        const gameText = `╭─❒ 『 WORD SCRAMBLE 』 ❒
│
├─❒ 🔤 *Scrambled Word:*
│ ${scrambled.split('').join(' ')}
│
├─❒ 📝 *Hints:*
│ • Length: ${word.length} letters
│ • First letter: ${word[0]}
│ • Category: ${this.getWordCategory(word)}
│
├─❒ ⏱️ *Time:* 60 seconds
│
╰──────────────────❒

Reply with your answer!`;

        await message.reply(gameText);
        setTimeout(() => this.endScrambleGame(message), 60000);
    }

    async startWordChain(message) {
        const firstWord = this.getRandomWord();
        
        const groupSession = session.getGroup(message.key.remoteJid);
        groupSession.games.word = {
            active: true,
            type: 'chain',
            lastWord: firstWord,
            usedWords: [firstWord],
            players: {},
            startTime: Date.now()
        };

        const gameText = `╭─❒ 『 WORD CHAIN 』 ❒
│
├─❒ 📝 *Rules:*
│ • Start with last letter
│ • No repeating words
│ • 15 seconds per turn
│
├─❒ 🎯 *Starting Word:*
│ ${firstWord.toUpperCase()}
│
├─❒ ⏱️ *Next word must start with:*
│ "${firstWord.slice(-1).toUpperCase()}"
│
╰──────────────────❒`;

        await message.reply(gameText);
    }

    // Helper methods
    scrambleWord(word) {
        return word.split('')
            .sort(() => Math.random() - 0.5)
            .join('');
    }

    getRandomWord() {
        return this.words[Math.floor(Math.random() * this.words.length)];
    }

    getWordCategory(word) {
        // Implement word categorization
        return "General";
    }

    async endScrambleGame(message) {
        const groupSession = session.getGroup(message.key.remoteJid);
        const game = groupSession.games.word;

        if (!game?.active) return;

        const endText = `╭─❒ 『 GAME OVER 』 ❒
│
├─❒ 📝 *Word was:* ${game.word}
├─❒ 🎯 *Attempts:* ${game.attempts}
├─❒ 🔍 *Hints used:* ${game.hints}
│
╰──────────────────❒`;

        await message.reply(endText);
        delete groupSession.games.word;
    }
}

module.exports = WordGamesCommand; 