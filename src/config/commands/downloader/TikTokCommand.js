const Command = require('../../structures/Command');
const axios = require('axios');

class TikTokCommand extends Command {
    constructor() {
        super({
            name: 'tt',
            description: 'Download TikTok videos without watermark',
            category: 'downloader',
            usage: '!tt <url>',
            cooldown: 10
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a TikTok URL!');
        }

        const url = args[0];

        try {
            message.reply('⏳ Processing your request...');
            
            // Using a free TikTok API
            const response = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
            
            if (response.data.success) {
                await message.client.sendMessage(message.key.remoteJid, {
                    video: { url: response.data.video_url },
                    caption: '✅ Downloaded using Dineth MD V1'
                });
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('TikTok download error:', error);
            message.reply('❌ Failed to download. Please try again later.');
        }
    }
}

module.exports = TikTokCommand; 