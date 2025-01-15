const Command = require('../../structures/Command');
const axios = require('axios');

class URLShortener extends Command {
    constructor() {
        super({
            name: 'short',
            aliases: ['shorturl', 'tiny'],
            description: 'Shorten long URLs',
            category: 'tools',
            usage: '.short <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 URL SHORTENER 』 ❒
│
├─❒ 🔗 *Usage:*
│ .short <url>
│
├─❒ 📝 *Example:*
│ .short https://example.com
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const url = args[0];
        await message.reply('⚡ *Shortening URL...*');

        try {
            const response = await axios.post('https://tinyurl.com/api-create.php', null, {
                params: { url }
            });

            const result = `╭─❒ 『 SHORTENED URL 』 ❒
│
├─❒ 📎 *Original:*
│ ${url}
│
├─❒ 🔗 *Shortened:*
│ ${response.data}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

            await message.reply(result);

        } catch (error) {
            console.error('URL shortener error:', error);
            message.reply('❌ Failed to shorten URL.');
        }
    }
}

module.exports = URLShortener; 