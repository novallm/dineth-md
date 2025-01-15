const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class AudioEqualizerCommand extends Command {
    constructor() {
        super({
            name: 'equalizer',
            aliases: ['eq'],
            description: 'Apply equalizer effects to audio',
            category: 'tools',
            usage: '.equalizer <reply to audio>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 AUDIO EQUALIZER 』 ❒
│
├─❒ 🎶 *Usage:*
│ .equalizer
│ (Reply to an audio file)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.mp3`);
            const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.mp3`);

            await fs.writeFile(inputPath, buffer);
            await message.reply('🎶 *Applying equalizer...*');

            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .audioFilters('equalizer=f=1000:t=q:w=200:g=10') // Example equalizer settings
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            await message.client.sendMessage(message.key.remoteJid, {
                audio: { url: outputPath },
                mimetype: 'audio/mp4',
                ptt: true,
                caption: '✨ Equalized audio by Dineth MD'
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Audio equalizer error:', error);
            message.reply('❌ Failed to apply equalizer.');
        }
    }
}

module.exports = AudioEqualizerCommand; 