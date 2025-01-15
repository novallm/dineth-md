const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class BackgroundRemover extends Command {
    constructor() {
        super({
            name: 'removebg',
            aliases: ['rmbg', 'nobg'],
            description: 'Remove background from images',
            category: 'tools',
            usage: '.removebg <reply to image>'
        });
    }

    async execute(message) {
        const quoted = message.quoted;
        if (!quoted || !quoted.message?.imageMessage) {
            return message.reply('Please reply to an image!');
        }

        await message.reply('🎨 *Removing background...*');

        try {
            const buffer = await downloadMediaMessage(quoted, 'buffer');
            const formData = new FormData();
            formData.append('image_file', buffer, { filename: 'image.jpg' });

            const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
                headers: {
                    'X-Api-Key': process.env.REMOVE_BG_KEY,
                    ...formData.getHeaders()
                },
                responseType: 'arraybuffer'
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: Buffer.from(response.data),
                caption: '✨ Background removed successfully!'
            });

        } catch (error) {
            console.error('Background removal error:', error);
            message.reply('❌ Failed to remove background.');
        }
    }
}

module.exports = BackgroundRemover; 