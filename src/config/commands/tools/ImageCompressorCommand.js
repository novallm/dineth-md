const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageCompressorCommand extends Command {
    constructor() {
        super({
            name: 'compress',
            aliases: ['imgcompress'],
            description: 'Compress images to reduce file size',
            category: 'tools',
            usage: '.compress <reply to image>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 IMAGE COMPRESSOR 』 ❒
│
├─❒ 📸 *Usage:*
│ .compress
│ (Reply to an image)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.jpg`);
            const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.jpg`);

            await fs.writeFile(inputPath, buffer);
            await message.reply('📉 *Compressing image...*');

            await sharp(inputPath)
                .jpeg({ quality: 50 }) // Compressing to 50% quality
                .toFile(outputPath);

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: outputPath },
                caption: '✨ Compressed image by Dineth MD'
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Image compression error:', error);
            message.reply('❌ Failed to compress image.');
        }
    }
}

module.exports = ImageCompressorCommand; 