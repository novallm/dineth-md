const Command = require('../../structures/Command');

class TruthDareCommand extends Command {
    constructor() {
        super({
            name: 'td',
            description: 'Play Truth or Dare',
            category: 'games',
            usage: '!td <truth/dare>'
        });

        this.truths = [
            "What's your biggest fear?",
            "What's your most embarrassing moment?",
            "What's the worst trouble you've ever been in?",
            // Add more truth questions
        ];

        this.dares = [
            "Send a funny selfie",
            "Text your crush",
            "Do 10 push-ups",
            // Add more dares
        ];
    }

    async execute(message, args) {
        const type = args[0]?.toLowerCase();
        
        if (!type || !['truth', 'dare'].includes(type)) {
            return message.reply('Please specify truth or dare!\nExample: !td truth');
        }

        const options = type === 'truth' ? this.truths : this.dares;
        const random = options[Math.floor(Math.random() * options.length)];

        const gameText = `🎮 *Truth or Dare*\n\n` +
            `Type: ${type.toUpperCase()}\n\n` +
            `${random}`;

        await message.client.sendText(message.key.remoteJid, gameText);
    }
}

module.exports = TruthDareCommand; 