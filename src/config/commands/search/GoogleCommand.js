const Command = require('../../structures/Command');
const cheerio = require('cheerio');
const axios = require('axios');

class GoogleCommand extends Command {
    constructor() {
        super({
            name: 'google',
            aliases: ['search', 'g'],
            description: 'Search Google',
            category: 'search',
            usage: '.google <query>'
        });
    }

    async execute(message, args) {
        if (!args.length) return message.reply('Please provide a search query!');

        const query = args.join(' ');
        await message.reply('🔍 *Searching Google...*');

        try {
            const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
            const $ = cheerio.load(response.data);
            
            let results = [];
            $('.g').each((i, element) => {
                if (i < 5) { // Get top 5 results
                    const title = $(element).find('h3').text();
                    const link = $(element).find('a').attr('href');
                    const snippet = $(element).find('.VwiC3b').text();
                    
                    if (title && link && snippet) {
                        results.push({
                            title: title,
                            link: link.startsWith('/url?q=') ? link.slice(7) : link,
                            snippet: snippet
                        });
                    }
                }
            });

            let searchText = `🔎 *Google Search Results*\n\n` +
                `Query: ${query}\n\n`;

            results.forEach((result, i) => {
                searchText += `*${i + 1}. ${result.title}*\n` +
                    `${result.snippet}\n` +
                    `Link: ${result.link}\n\n`;
            });

            await message.reply(searchText);
        } catch (error) {
            console.error('Google search error:', error);
            message.reply('❌ Failed to search Google. Please try again.');
        }
    }
}

module.exports = GoogleCommand; 