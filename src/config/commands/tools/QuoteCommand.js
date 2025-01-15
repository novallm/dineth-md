const Command = require('../../structures/Command');
const axios = require('axios');

class QuoteCommand extends Command {
    constructor() {
        super({
            name: 'quote',
            aliases: ['qotd'],
            description: 'Get a random quote',
            category: 'tools',
            usage: '.quote'
        });
    }

    async execute(message) {
        await message.reply('📜 *Fetching a quote...*');

        try {
            const response = await axios.get('https://api.quotable.io/random');
            const quoteText = `📜 *"${response.data.content}"*\n— *${response.data.author}*`;

            await message.reply(quoteText);

        } catch (error) {
            console.error('Quote error:', error);
            message.reply('❌ Failed to fetch a quote.');
        }
    }
}

module.exports = QuoteCommand;