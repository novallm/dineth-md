const Command = require('../../structures/Command');
const axios = require('axios');

class TikTokDownloader extends Command {
    constructor() {
        super({
            name: 'tt',
            aliases: ['tiktok'],
            description: 'Download TikTok videos without watermark',
            category: 'downloader',
            usage: '!tt <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('*Please provide a TikTok URL!*\n\nExample: !tt https://vm.tiktok.com/xxx');
        }

        const url = args[0];

        try {
            await message.reply('⏳ *Processing your request...*');

            // Using a free TikTok API
            const response = await axios.get('https://api.tiklydown.link/api/download', {
                params: { url }
            });

            const data = response.data;
            
            // Send video without watermark
            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: data.video.noWatermark },
                caption: `✨ *TikTok Download*\n\n` +
                        `👤 Author: ${data.author.nickname}\n` +
                        `📝 Description: ${data.description}\n\n` +
                        `❤️ Likes: ${data.statistics.likeCount}\n` +
                        `💬 Comments: ${data.statistics.commentCount}\n` +
                        `🔁 Shares: ${data.statistics.shareCount}\n\n` +
                        `✅ Downloaded by Dineth MD`
            });

        } catch (error) {
            console.error('TikTok download error:', error);
            message.reply('❌ Failed to download. Please try another video.');
        }
    }
}

module.exports = TikTokDownloader; 