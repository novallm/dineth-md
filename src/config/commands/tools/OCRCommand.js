const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;

class OCRCommand extends Command {
    constructor() {
        super({
            name: 'ocr',
            aliases: ['imagetotext'],
            description: 'Extract text from images',
            category: 'tools',
            usage: '.ocr <reply to image>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 OCR 』 ❒
│
├─❒ 📸 *Usage:*
│ .ocr
│ (Reply to an image)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.png`);
            await fs.writeFile(inputPath, buffer);

            await message.reply('🔍 *Extracting text from image...*');

            const { data: { text } } = await Tesseract.recognize(inputPath, 'eng');

            await message.reply(`📜 *Extracted Text:*\n${text}\n✨ Processed by Dineth MD`);

            // Cleanup
            await fs.unlink(inputPath);

        } catch (error) {
            console.error('OCR error:', error);
            message.reply('❌ Failed to extract text from image.');
        }
    }
}

module.exports = OCRCommand; 