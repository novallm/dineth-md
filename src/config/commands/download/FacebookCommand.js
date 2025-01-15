const Command = require('../../structures/Command');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class FacebookCommand extends Command {
    constructor() {
        super({
            name: 'fb',
            aliases: ['facebook', 'fbdl'],
            description: 'Download Facebook videos',
            category: 'download'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 FB DOWNLOADER 』 ❒
│
├─❒ 📥 *Commands*
│ • .fb <url> - Download video
│ • .fb hd <url> - HD quality
│ • .fb audio <url> - Audio only
│
├─❒ 📊 *Supported*
│ • Facebook Videos
│ • Facebook Reels
│ • Facebook Stories
│
├─❒ 📝 *Example*
│ .fb https://fb.watch/xxx
│
╰──────────────────❒`);
        }

        await message.reply('⏳ *Processing Facebook video...*');

        try {
            const url = args[0];
            const tempPath = path.join(__dirname, '../../../temp', `${Date.now()}.mp4`);

            // Download video
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
                caption: '📥 *Downloaded from Facebook*\nPowered by Dineth MD',
                gifPlayback: false
            });

            // Clean up
            await fs.unlink(tempPath);

        } catch (error) {
            console.error('Facebook download error:', error);
            message.reply('❌ Failed to download Facebook video. Please check the URL.');
        }
    }
}

module.exports = FacebookCommand; 