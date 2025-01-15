const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class FaceDetectionCommand extends Command {
    constructor() {
        super({
            name: 'facedetect',
            aliases: ['face'],
            description: 'Detect faces in images',
            category: 'tools',
            usage: '.facedetect <reply to image>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 FACE DETECTION 』 ❒
│
├─❒ 📸 *Usage:*
│ .facedetect
│ (Reply to an image)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.jpg`);
            await fs.writeFile(inputPath, buffer);

            await message.reply('🔍 *Detecting faces...*');

            const response = await axios.post('https://api.faceapi.com/detect', {
                image: inputPath
            });

            const faces = response.data.faces;
            let resultText = `👤 *Detected Faces:*\n`;

            faces.forEach((face, index) => {
                resultText += `Face ${index + 1}: ${face.confidence}% confidence\n`;
            });

            await message.reply(resultText + '✨ Processed by Dineth MD');

            // Cleanup
            await fs.unlink(inputPath);

        } catch (error) {
            console.error('Face detection error:', error);
            message.reply('❌ Failed to detect faces.');
        }
    }
}

module.exports = FaceDetectionCommand; 