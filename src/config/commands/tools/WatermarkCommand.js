const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class WatermarkCommand extends Command {
    constructor() {
        super({
            name: 'watermark',
            aliases: ['wm'],
            description: 'Add a watermark to images',
            category: 'tools',
            usage: '.watermark <reply to image>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 WATERMARK ADDER 』 ❒
│
├─❒ 💧 *Usage:*
│ .watermark
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
            await message.reply('💧 *Adding watermark...*');

            const watermark = await sharp('path/to/watermark.png').resize(200, 100).toBuffer();

            await sharp(inputPath)
                .composite([{ input: watermark, gravity: 'southeast' }]) // Positioning the watermark
                .toFile(outputPath);

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: outputPath },
                caption: '✨ Watermarked image by Dineth MD'
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Watermark error:', error);
            message.reply('❌ Failed to add watermark.');
        }
    }
}

module.exports = WatermarkCommand; 