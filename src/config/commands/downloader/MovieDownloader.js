const Command = require('../../structures/Command');
const axios = require('axios');
const cheerio = require('cheerio');

class MovieDownloader extends Command {
    constructor() {
        super({
            name: 'movie',
            aliases: ['film', 'download'],
            description: 'Search and download movies',
            category: 'downloader',
            usage: '.movie <name>'
        });
    }

    async execute(message, args) {
        if (!args.length) return message.reply('Please provide a movie name!');

        const movieName = args.join(' ');
        await message.reply('🔍 *Searching for movie...*');

        try {
            // Search movie on various free movie sites
            const sites = [
                'https://vegamovies.dad',
                'https://mlwbd.top',
                // Add more sites
            ];

            let movieResults = [];
            for (const site of sites) {
                const results = await this.searchMovie(site, movieName);
                movieResults = [...movieResults, ...results];
            }

            if (movieResults.length > 0) {
                let resultText = `🎬 *Movie Search Results*\n\n`;
                movieResults.slice(0, 5).forEach((movie, i) => {
                    resultText += `*${i + 1}. ${movie.title}*\n` +
                        `Quality: ${movie.quality}\n` +
                        `Size: ${movie.size}\n` +
                        `Link: ${movie.link}\n\n`;
                });

                await message.reply(resultText);
            } else {
                message.reply('❌ No movies found! Try another name.');
            }
        } catch (error) {
            console.error('Movie search error:', error);
            message.reply('❌ Failed to search movies. Please try again.');
        }
    }

    async searchMovie(site, query) {
        try {
            const response = await axios.get(`${site}/search/${encodeURIComponent(query)}`);
            const $ = cheerio.load(response.data);
            
            let results = [];
            // Implement site-specific scraping logic
            // This is just an example structure
            $('.movie-item').each((i, element) => {
                results.push({
                    title: $(element).find('.title').text(),
                    quality: $(element).find('.quality').text(),
                    size: $(element).find('.size').text(),
                    link: $(element).find('a').attr('href')
                });
            });

            return results;
        } catch (error) {
            console.error(`Error searching ${site}:`, error);
            return [];
        }
    }
}

module.exports = MovieDownloader; 