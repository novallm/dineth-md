const Command = require('../../structures/Command');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class TikTokCommand extends Command {
    constructor() {
        super({
            name: 'tiktok',
            aliases: ['tt', 'tik'],
            description: 'Download TikTok videos',
            category: 'download'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 TIKTOK DOWNLOADER 』 ❒
│
├─❒ 📥 *Commands*
│ • .tt <url> - Download video
│ • .tt audio <url> - Audio only
│ • .tt profile <username>
│
├─❒ 📊 *Features*
│ • No Watermark
│ • High Quality
│ • Fast Download
│
├─❒ 📝 *Example*
│ .tt https://vm.tiktok.com/xxx
│
╰──────────────────❒`);
        }

        await message.reply('⏳ *Processing TikTok...*');

        try {
            const url = args[0];
            const tempPath = path.join(__dirname, '../../../temp', `${Date.now()}.mp4`);
            
            // Download video without watermark
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            });

            await new Promise((resolve, reject) => {
                const stream = fs.createWriteStream(tempPath);
                response.data.pipe(stream);
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            // Send the video
            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: tempPath },
                caption: '🎵 *Downloaded from TikTok*\nPowered by Dineth MD',
                gifPlayback: false
            });

            // Clean up
            await fs.unlink(tempPath);

        } catch (error) {
            console.error('TikTok download error:', error);
            message.reply('❌ Failed to download TikTok. Please check the URL.');
        }
    }
}

module.exports = TikTokCommand; 