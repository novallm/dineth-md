const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class AIEnhancerCommand extends Command {
    constructor() {
        super({
            name: 'enhance',
            aliases: ['upscale', 'hd'],
            description: 'Enhance images using AI',
            category: 'tools',
            usage: '.enhance <reply to image>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 AI IMAGE ENHANCER 』 ❒
│
├─❒ 🎨 *Features:*
│ • Upscale Resolution
│ • Enhance Quality
│ • Fix Artifacts
│ • Sharpen Details
│
├─❒ 📝 *Usage:*
│ .enhance
│ (Reply to an image)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            await message.reply('🎨 *Enhancing image with AI...*');

            const formData = new FormData();
            formData.append('image', buffer, { filename: 'image.jpg' });

            const response = await axios.post('https://api.deepai.org/api/torch-srgan', formData, {
                headers: {
                    'api-key': process.env.DEEPAI_API_KEY,
                    ...formData.getHeaders()
                }
            });

            const enhancedImage = await axios.get(response.data.output_url, {
                responseType: 'arraybuffer'
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: Buffer.from(enhancedImage.data),
                caption: '✨ Enhanced by Dineth MD AI'
            });

        } catch (error) {
            console.error('Image enhancement error:', error);
            message.reply('❌ Failed to enhance image.');
        }
    }
}

module.exports = AIEnhancerCommand; 