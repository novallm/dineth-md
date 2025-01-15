const Command = require('../../structures/Command');
const axios = require('axios');

class CategoryQuoteCommand extends Command {
    constructor() {
        super({
            name: 'categoryquote',
            aliases: ['cq'],
            description: 'Get a random quote from a specific category',
            category: 'tools',
            usage: '.categoryquote <category>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 CATEGORY QUOTE 』 ❒
│
├─❒ 📜 *Usage:*
│ .categoryquote <category>
│
├─❒ 📝 *Example:*
│ .categoryquote inspirational
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const category = args.join(' ');
        await message.reply('📜 *Fetching a quote...*');

        try {
            const response = await axios.get(`https://api.quotable.io/random?tags=${category}`);
            const quoteText = `📜 *"${response.data.content}"*\n— *${response.data.author}*`;

            await message.reply(quoteText);

        } catch (error) {
            console.error('Category quote error:', error);
            message.reply('❌ Failed to fetch a quote from that category.');
        }
    }
}

module.exports = CategoryQuoteCommand;