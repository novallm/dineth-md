const Command = require('../../structures/Command');
const axios = require('axios');
const cheerio = require('cheerio');

class SearchCommand extends Command {
    constructor() {
        super({
            name: 'search',
            aliases: ['find', 'google'],
            description: 'Advanced web search',
            category: 'tools',
            usage: '.search <query>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 SEARCH 』 ❒
│
├─❒ 🔍 *Usage:*
│ .search <query>
│
├─❒ 📝 *Example:*
│ .search what is nodejs
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const query = args.join(' ');
        await message.reply('🔍 *Searching...*');

        try {
            const results = await this.googleSearch(query);
            let searchText = `🔍 *Search Results for:* ${query}\n\n`;

            results.slice(0, 5).forEach((result, index) => {
                searchText += `${index + 1}. *${result.title}*\n`;
                searchText += `${result.description}\n`;
                searchText += `🔗 ${result.link}\n\n`;
            });

            searchText += '✨ Powered by Dineth MD';
            await message.reply(searchText);

        } catch (error) {
            console.error('Search error:', error);
            message.reply('❌ Failed to perform search.');
        }
    }

    async googleSearch(query) {
        const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);
        const results = [];

        $('.g').each((i, element) => {
            const title = $(element).find('h3').text();
            const link = $(element).find('a').attr('href');
            const description = $(element).find('.VwiC3b').text();

            if (title && link && description) {
                results.push({ title, link, description });
            }
        });

        return results;
    }
}

module.exports = SearchCommand; 