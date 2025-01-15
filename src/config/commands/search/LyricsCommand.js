const Command = require('../../structures/Command');
const axios = require('axios');
const cheerio = require('cheerio');

class LyricsCommand extends Command {
    constructor() {
        super({
            name: 'lyrics',
            description: 'Search for song lyrics',
            category: 'search',
            usage: '!lyrics <song name>',
            cooldown: 5
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a song name!');
        }

        const query = args.join(' ');

        try {
            message.reply('🔍 Searching for lyrics...');

            // Using Genius API (free with key)
            const response = await axios.get(
                `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.GENIUS_API_KEY}`
                    }
                }
            );

            if (response.data.response.hits.length > 0) {
                const song = response.data.response.hits[0].result;
                const lyricsUrl = song.url;

                // Scrape lyrics from Genius page
                const lyricsResponse = await axios.get(lyricsUrl);
                const $ = cheerio.load(lyricsResponse.data);
                const lyrics = $('div.lyrics').text().trim();

                const lyricsText = `🎵 *${song.title}*\n` +
                    `👤 Artist: ${song.primary_artist.name}\n\n` +
                    `📝 Lyrics:\n\n${lyrics}`;

                await message.client.sendText(message.key.remoteJid, lyricsText);
            } else {
                message.reply('❌ Lyrics not found!');
            }
        } catch (error) {
            console.error('Lyrics search error:', error);
            message.reply('❌ Failed to find lyrics.');
        }
    }
}

module.exports = LyricsCommand; 