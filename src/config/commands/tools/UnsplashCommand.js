const Command = require('../../structures/Command');
const axios = require('axios');

class UnsplashCommand extends Command {
    constructor() {
        super({
            name: 'unsplash',
            aliases: ['randomimage'],
            description: 'Get a random image from Unsplash',
            category: 'tools',
            usage: '.unsplash'
        });
    }

    async execute(message) {
        await message.reply('📸 *Fetching a random image...*');

        try {
            const response = await axios.get('https://api.unsplash.com/photos/random', {
                headers: {
                    Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
                }
            });
            const imageUrl = response.data.urls.regular;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: imageUrl },
                caption: '📸✨ Here is your random image from Unsplash!'
            });

        } catch (error) {
            console.error('Unsplash error:', error);
            message.reply('❌ Failed to fetch a random image.');
        }
    }
}

module.exports = UnsplashCommand; 