const Command = require('../../structures/Command');
const instagramGetUrl = require("instagram-url-direct");
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class InstagramCommand extends Command {
    constructor() {
        super({
            name: 'ig',
            aliases: ['insta', 'igdl'],
            description: 'Download Instagram posts/stories',
            category: 'download',
            usage: '.ig <instagram url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 INSTAGRAM DL 』 ❒
│
├─❒ 📥 *Usage:*
│ .ig <instagram url>
│
├─❒ 📝 *Supported:*
│ • Posts
│ • Reels
│ • Stories
│ • IGTV
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const url = args[0];
        await message.reply('⏳ *Processing...*');

        try {
            const igResult = await instagramGetUrl(url);
            
            if (!igResult.url_list.length) {
                return message.reply('❌ No downloadable content found!');
            }

            for (const mediaUrl of igResult.url_list) {
                const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                const ext = mediaUrl.includes('.mp4') ? '.mp4' : '.jpg';
                const outputPath = path.join(__dirname, `../../../temp/${Date.now()}${ext}`);
                
                await fs.writeFile(outputPath, buffer);

                if (ext === '.mp4') {
                    await message.client.sendMessage(message.key.remoteJid, {
                        video: { url: outputPath },
                        caption: '✨ Downloaded by Dineth MD'
                    });
                } else {
                    await message.client.sendMessage(message.key.remoteJid, {
                        image: { url: outputPath },
                        caption: '✨ Downloaded by Dineth MD'
                    });
                }

                await fs.unlink(outputPath);
            }

        } catch (error) {
            console.error('Instagram download error:', error);
            message.reply('❌ Failed to download content.');
        }
    }
}

module.exports = InstagramCommand; 