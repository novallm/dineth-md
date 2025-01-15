const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class VideoTrimmerCommand extends Command {
    constructor() {
        super({
            name: 'trim',
            aliases: ['videotrim'],
            description: 'Trim videos to a specific duration',
            category: 'tools',
            usage: '.trim <start> <duration> <reply to video>'
        });
    }

    async execute(message, args) {
        if (args.length < 2 || !message.quoted) {
            return message.reply(`╭─❒ 『 VIDEO TRIMMER 』 ❒
│
├─❒ 🎥 *Usage:*
│ .trim <start> <duration>
│ (Reply to a video)
│
├─❒ 📝 *Example:*
│ .trim 00:00:10 00:00:30
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const start = args[0];
        const duration = args[1];
        const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.mp4`);
        const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.mp4`);

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            await fs.writeFile(inputPath, buffer);
            await message.reply('✂️ *Trimming video...*');

            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .setStartTime(start)
                    .setDuration(duration)
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: outputPath },
                caption: `✨ Trimmed video from ${start} for ${duration}\nProcessed by Dineth MD`
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Video trimming error:', error);
            message.reply('❌ Failed to trim video.');
        }
    }
}

module.exports = VideoTrimmerCommand; 