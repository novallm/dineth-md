const Command = require('../../structures/Command');
const axios = require('axios');

class InstagramDownloader extends Command {
    constructor() {
        super({
            name: 'ig',
            aliases: ['insta'],
            description: 'Download Instagram posts/reels',
            category: 'downloader',
            usage: '!ig <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('*Please provide an Instagram URL!*\n\nExample: !ig https://www.instagram.com/p/xxx');
        }

        const url = args[0];

        try {
            await message.reply('⏳ *Processing your request...*');

            // Using a free Instagram downloader API
            const response = await axios.get('https://api.lolhuman.xyz/api/instagram', {
                params: {
                    url: url,
                    apikey: process.env.LOLHUMAN_API_KEY
                }
            });

            const mediaUrls = response.data.result;

            for (const mediaUrl of mediaUrls) {
                if (mediaUrl.includes('.mp4')) {
                    await message.client.sendMessage(message.key.remoteJid, {
                        video: { url: mediaUrl },
                        caption: '✅ Downloaded by Dineth MD'
                    });
                } else {
                    await message.client.sendMessage(message.key.remoteJid, {
                        image: { url: mediaUrl },
                        caption: '✅ Downloaded by Dineth MD'
                    });
                }
            }
        } catch (error) {
            console.error('Instagram download error:', error);
            message.reply('❌ Failed to download. Please try another post.');
        }
    }
}

module.exports = InstagramDownloader; 