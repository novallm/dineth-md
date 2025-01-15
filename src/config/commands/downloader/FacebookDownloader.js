const Command = require('../../structures/Command');
const axios = require('axios');

class FacebookDownloader extends Command {
    constructor() {
        super({
            name: 'fb',
            aliases: ['facebook'],
            description: 'Download Facebook videos/reels',
            category: 'downloader',
            usage: '!fb <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('*Please provide a Facebook URL!*\n\nExample: !fb https://fb.watch/xxx');
        }

        const url = args[0];

        try {
            await message.reply('⏳ *Processing your request...*');

            // Using a free Facebook downloader API
            const response = await axios.get('https://api.lolhuman.xyz/api/facebook', {
                params: {
                    url: url,
                    apikey: process.env.LOLHUMAN_API_KEY
                }
            });

            const videoUrl = response.data.result[0];

            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: videoUrl },
                caption: '✅ Downloaded by Dineth MD'
            });

        } catch (error) {
            console.error('Facebook download error:', error);
            message.reply('❌ Failed to download. Please try another video.');
        }
    }
}

module.exports = FacebookDownloader; 