const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class FileConverterCommand extends Command {
    constructor() {
        super({
            name: 'convert',
            aliases: ['conv', 'toformat'],
            description: 'Convert files between formats',
            category: 'tools',
            usage: '.convert <format>'
        });

        this.supportedFormats = {
            audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
            video: ['mp4', 'mkv', 'avi', 'mov', 'gif'],
            image: ['jpg', 'png', 'webp', 'bmp']
        };
    }

    async execute(message, args) {
        if (!args[0] || !message.quoted) {
            return message.reply(`╭─❒ 『 FILE CONVERTER 』 ❒
│
├─❒ 🎵 *Audio Formats:*
│ • MP3, WAV, OGG, M4A, AAC
│
├─❒ 🎥 *Video Formats:*
│ • MP4, MKV, AVI, MOV, GIF
│
├─❒ 🖼️ *Image Formats:*
│ • JPG, PNG, WEBP, BMP
│
├─❒ 📝 *Usage:*
│ .convert <format>
│ (Reply to a file)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const targetFormat = args[0].toLowerCase();
        const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}`);
        const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.${targetFormat}`);

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            await fs.writeFile(inputPath, buffer);

            await message.reply('⚙️ *Converting file...*');

            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .toFormat(targetFormat)
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            await message.client.sendMessage(message.key.remoteJid, {
                document: { url: outputPath },
                mimetype: `application/${targetFormat}`,
                fileName: `converted.${targetFormat}`,
                caption: '✨ Converted by Dineth MD'
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('File conversion error:', error);
            message.reply('❌ Failed to convert file. Please check the format.');
        }
    }
}

module.exports = FileConverterCommand; 