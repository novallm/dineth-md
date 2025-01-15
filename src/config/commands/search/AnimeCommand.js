const Command = require('../../structures/Command');
const axios = require('axios');

class AnimeCommand extends Command {
    constructor() {
        super({
            name: 'anime',
            description: 'Search for anime information',
            category: 'search',
            usage: '!anime <title>',
            cooldown: 5
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide an anime title!');
        }

        const title = args.join(' ');

        try {
            const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}`);
            
            if (response.data.data.length > 0) {
                const anime = response.data.data[0];
                const animeText = `🎌 *${anime.title}* (${anime.title_japanese})\n\n` +
                    `⭐ Rating: ${anime.score}/10\n` +
                    `📺 Episodes: ${anime.episodes}\n` +
                    `🎭 Genre: ${anime.genres.map(g => g.name).join(', ')}\n` +
                    `📅 Status: ${anime.status}\n\n` +
                    `📝 Synopsis: ${anime.synopsis?.substring(0, 300)}...\n\n` +
                    `🔗 More info: ${anime.url}`;

                await message.client.sendMessage(message.key.remoteJid, {
                    image: { url: anime.images.jpg.large_image_url },
                    caption: animeText
                });
            } else {
                message.reply('❌ Anime not found!');
            }
        } catch (error) {
            console.error('Anime search error:', error);
            message.reply('❌ Failed to search for anime.');
        }
    }
}

module.exports = AnimeCommand; 