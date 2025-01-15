const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class VoiceEffectsCommand extends Command {
    constructor() {
        super({
            name: 'voicefx',
            aliases: ['voicemaker', 'vfx'],
            description: 'Apply effects to voice messages',
            category: 'tools',
            usage: '.voicefx <effect>'
        });

        this.effects = {
            echo: (cmd) => cmd.audioFilters('aecho=0.8:0.88:60:0.4'),
            chipmunk: (cmd) => cmd.audioFilters('asetrate=44100*1.5'),
            robot: (cmd) => cmd.audioFilters('atempo=0.8'),
            reverb: (cmd) => cmd.audioFilters('aecho=0.8:0.88:60:0.4'),
            bass: (cmd) => cmd.audioFilters('bass=g=10')
        };
    }

    async execute(message, args) {
        if (!args[0] || !message.quoted) {
            return message.reply(`╭─❒ 『 VOICE EFFECTS 』 ❒
│
├─❒ 🎤 *Effects:*
│ • echo - Echo effect
│ • chipmunk - High pitch
│ • robot - Robotic voice
│ • reverb - Reverb effect
│ • bass - Bass boost
│
├─❒ 📝 *Usage:*
│ .voicefx <effect>
│ (Reply to a voice message)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const effect = args[0].toLowerCase();
        if (!this.effects[effect]) {
            return message.reply('❌ Invalid effect!');
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.mp3`);
            const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.mp3`);

            await fs.writeFile(inputPath, buffer);
            await message.reply('🎤 *Applying voice effect...*');

            await new Promise((resolve, reject) => {
                let command = ffmpeg(inputPath);
                command = this.effects[effect](command);
                command
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            await message.client.sendMessage(message.key.remoteJid, {
                audio: { url: outputPath },
                mimetype: 'audio/mp4',
                ptt: true,
                caption: `✨ Effect: ${effect}\nProcessed by Dineth MD`
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Voice effects error:', error);
            message.reply('❌ Failed to apply voice effect.');
        }
    }
}

module.exports = VoiceEffectsCommand; 