const Command = require('../../structures/Command');
const axios = require('axios');

class AuthorQuoteCommand extends Command {
    constructor() {
        super({
            name: 'authorquote',
            aliases: ['aq'],
            description: 'Get a random quote from a specific author',
            category: 'tools',
            usage: '.authorquote <author>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 AUTHOR QUOTE 』 ❒
│
├─❒ 📜 *Usage:*
│ .authorquote <author>
│
├─❒ 📝 *Example:*
│ .authorquote Einstein
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const author = args.join(' ');
        await message.reply('📜 *Fetching a quote...*');

        try {
            const response = await axios.get(`https://api.quotable.io/random?author=${author}`);
            const quoteText = `📜 *"${response.data.content}"*\n— *${response.data.author}*`;

            await message.reply(quoteText);

        } catch (error) {
            console.error('Author quote error:', error);
            message.reply('❌ Failed to fetch a quote from that author.');
        }
    }
}

module.exports = AuthorQuoteCommand;