const Command = require('../../structures/Command');
const axios = require('axios');

class GifCommand extends Command {
    constructor() {
        super({
            name: 'gif',
            aliases: ['randomgif'],
            description: 'Get a random GIF',
            category: 'tools',
            usage: '.gif'
        });
    }

    async execute(message) {
        await message.reply('🎞️ *Fetching a random GIF...*');

        try {
            const response = await axios.get('https://api.giphy.com/v1/gifs/random', {
                params: {
                    api_key: process.env.GIPHY_API_KEY
                }
            });
            const gifUrl = response.data.data.images.original.url;

            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: gifUrl },
                caption: '🎞️✨ Here is your random GIF!'
            });

        } catch (error) {
            console.error('GIF error:', error);
            message.reply('❌ Failed to fetch a GIF.');
        }
    }
}

module.exports = GifCommand;