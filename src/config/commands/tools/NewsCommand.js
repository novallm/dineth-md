const Command = require('../../structures/Command');
const axios = require('axios');

class NewsCommand extends Command {
    constructor() {
        super({
            name: 'news',
            aliases: ['headlines'],
            description: 'Get the latest news headlines',
            category: 'tools',
            usage: '.news <category>'
        });

        this.categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    }

    async execute(message, args) {
        const category = args[0] ? args[0].toLowerCase() : 'general';

        if (!this.categories.includes(category)) {
            return message.reply(`╭─❒ 『 NEWS 』 ❒
│
├─❒ 📰 *Usage:*
│ .news <category>
│
├─❒ 📋 *Available Categories:*
│ ${this.categories.join(', ')}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        await message.reply('📰 *Fetching the latest news...*');

        try {
            const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
                params: {
                    category: category,
                    apiKey: process.env.NEWS_API_KEY,
                    country: 'us'
                }
            });

            const articles = response.data.articles.slice(0, 5);
            let newsText = `📰 *Latest News in ${category.charAt(0).toUpperCase() + category.slice(1)}:*\n`;

            articles.forEach((article, index) => {
                newsText += `\n${index + 1}. ${article.title}\n🔗 ${article.url}`;
            });

            await message.reply(newsText);

        } catch (error) {
            console.error('News error:', error);
            message.reply('❌ Failed to fetch news.');
        }
    }
}

module.exports = NewsCommand;