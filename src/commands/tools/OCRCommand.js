const Command = require('../../structures/Command');
const { createWorker } = require('tesseract.js');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const path = require('path');
const fs = require('fs').promises;

class OCRCommand extends Command {
    constructor() {
        super({
            name: 'ocr',
            aliases: ['read', 'textfromimg'],
            description: 'Extract text from images',
            category: 'tools',
            usage: '.ocr <reply to image>'
        });
    }

    async execute(message) {
        if (!message.quoted || !message.quoted.message?.imageMessage) {
            return message.reply(`╭─❒ 『 TEXT RECOGNITION 』 ❒
│
├─❒ 📝 *Usage:*
│ Reply to an image with .ocr
│
├─❒ 📸 *Supported:*
│ • Text in images
│ • Documents
│ • Screenshots
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        await message.reply('🔍 *Extracting text...*');

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const worker = await createWorker();
            
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            
            const { data: { text } } = await worker.recognize(buffer);
            await worker.terminate();

            if (!text.trim()) {
                return message.reply('❌ No text found in image!');
            }

            const result = `╭─❒ 『 EXTRACTED TEXT 』 ❒
│
├─❒ 📝 *Content:*
│ ${text.trim()}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

            await message.reply(result);

        } catch (error) {
            console.error('OCR error:', error);
            message.reply('❌ Failed to extract text.');
        }
    }
}

module.exports = OCRCommand; 