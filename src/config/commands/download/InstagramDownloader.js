const Command = require('../../structures/Command');
const axios = require('axios');

class InstagramDownloader extends Command {
    constructor() {
        super({
            name: 'ig',
            aliases: ['insta', 'igdl'],
            description: 'Download Instagram content',
            category: 'download',
            usage: '.ig <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 INSTAGRAM DL 』 ❒
│
├─❒ 📥 *Commands*
│ • .ig <url> - Download post
│ • .ig story <username>
│ • .ig reel <url>
│ • .ig tv <url>
│
├─❒ 📊 *Supported*
│ • Photos & Albums
│ • Reels & Videos
│ • IGTV Videos
│ • Stories
│
╰──────────────────❒`);
        }

        await message.reply('⏳ *Processing Instagram content...*');

        try {
            const url = args[0];
            const response = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=${process.env.LOLHUMAN_API_KEY}&url=${url}`);
            
            const media = response.data.result;
            for (const url of media) {
                if (url.includes('.mp4')) {
                    await message.client.sendMessage(message.key.remoteJid, {
                        video: { url },
                        caption: '✅ Downloaded by Dineth MD'
                    });
                } else {
                    await message.client.sendMessage(message.key.remoteJid, {
                        image: { url },
                        caption: '✅ Downloaded by Dineth MD'
                    });
                }
            }
        } catch (error) {
            console.error('Instagram download error:', error);
            message.reply('❌ Failed to download. Please check the URL.');
        }
    }
}

module.exports = InstagramDownloader; 