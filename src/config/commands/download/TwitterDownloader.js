const Command = require('../../structures/Command');
const axios = require('axios');

class TwitterDownloader extends Command {
    constructor() {
        super({
            name: 'twitter',
            aliases: ['tw', 'twdl'],
            description: 'Download Twitter videos',
            category: 'download',
            usage: '.twitter <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 TWITTER DL 』 ❒
│
├─❒ 📥 *Commands*
│ • .tw <url> - Download video
│ • .tw audio <url> - Audio only
│ • .tw thread <url> - Thread
│
├─❒ 📊 *Features*
│ • HD Quality
│ • No Watermark
│ • Thread Support
│
╰──────────────────❒`);
        }

        await message.reply('⏳ *Processing Twitter content...*');

        try {
            const url = args[0];
            const response = await axios.get(`https://api.lolhuman.xyz/api/twitter?apikey=${process.env.LOLHUMAN_API_KEY}&url=${url}`);
            
            const video = response.data.result.link[0].link;
            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: video },
                caption: '✅ Downloaded by Dineth MD'
            });
        } catch (error) {
            console.error('Twitter download error:', error);
            message.reply('❌ Failed to download. Please check the URL.');
        }
    }
}

module.exports = TwitterDownloader; 