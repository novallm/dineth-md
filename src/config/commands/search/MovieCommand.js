const Command = require('../../structures/Command');
const axios = require('axios');

class MovieCommand extends Command {
    constructor() {
        super({
            name: 'movie',
            description: 'Search for movie information',
            category: 'search',
            usage: '!movie <title>',
            cooldown: 5
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a movie title!');
        }

        const title = args.join(' ');

        try {
            // Using OMDB API (free with key)
            const response = await axios.get(
                `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.OMDB_API_KEY}`
            );

            if (response.data.Response === 'True') {
                const movie = response.data;
                const movieText = `🎬 *${movie.Title}* (${movie.Year})\n\n` +
                    `⭐ Rating: ${movie.imdbRating}/10\n` +
                    `🎭 Genre: ${movie.Genre}\n` +
                    `⏱️ Runtime: ${movie.Runtime}\n` +
                    `👥 Cast: ${movie.Actors}\n\n` +
                    `📝 Plot: ${movie.Plot}`;

                if (movie.Poster !== 'N/A') {
                    await message.client.sendMessage(message.key.remoteJid, {
                        image: { url: movie.Poster },
                        caption: movieText
                    });
                } else {
                    await message.client.sendText(message.key.remoteJid, movieText);
                }
            } else {
                message.reply('❌ Movie not found!');
            }
        } catch (error) {
            console.error('Movie search error:', error);
            message.reply('❌ Failed to search for the movie.');
        }
    }
}

module.exports = MovieCommand; 