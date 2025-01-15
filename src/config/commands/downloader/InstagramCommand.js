const Command = require('../../structures/Command');
const axios = require('axios');

class InstagramCommand extends Command {
    constructor() {
        super({
            name: 'ig',
            description: 'Download Instagram videos/photos',
            category: 'downloader',
            usage: '!ig <url>',
            cooldown: 10
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide an Instagram URL!');
        }

        const url = args[0];
        
        try {
            message.reply('⏳ Processing your request...');
            
            // Download logic here using Instagram API
            const response = await axios.get(`https://api.example.com/instagram?url=${url}`);
            const mediaUrl = response.data.url;

            // Send the media
            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: mediaUrl },
                caption: '✅ Downloaded using Dineth MD V1'
            });

        } catch (error) {
            console.error('Instagram download error:', error);
            message.reply('❌ Failed to download. Please try again later.');
        }
    }
}

module.exports = InstagramCommand; 