const Command = require('../../structures/Command');
const gtts = require('node-gtts');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class TTSCommand extends Command {
    constructor() {
        super({
            name: 'tts',
            aliases: ['say', 'speak'],
            description: 'Convert text to speech',
            category: 'tools',
            usage: '.tts <lang> <text>'
        });

        this.languages = {
            'en': 'English',
            'si': 'Sinhala',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'ar': 'Arabic',
            'id': 'Indonesian',
            'ja': 'Japanese',
            'ko': 'Korean'
        };
    }

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply(`╭─❒ 『 TEXT TO SPEECH 』 ❒
│
├─❒ 🗣️ *Usage:*
│ .tts <lang> <text>
│
├─❒ 📝 *Example:*
│ .tts en Hello World
│
├─❒ 🌐 *Languages:*
${Object.entries(this.languages).map(([code, name]) => `│ • ${code} - ${name}`).join('\n')}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const lang = args[0];
        const text = args.slice(1).join(' ');

        if (!this.languages[lang]) {
            return message.reply('❌ Invalid language code!');
        }

        try {
            await message.reply('🎵 *Generating audio...*');

            const outputPath = path.join(__dirname, `../../../temp/${uuidv4()}.mp3`);
            const tts = gtts(lang);

            await new Promise((resolve, reject) => {
                tts.save(outputPath, text, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            await message.client.sendMessage(message.key.remoteJid, {
                audio: { url: outputPath },
                mimetype: 'audio/mp4',
                ptt: true
            });

            await fs.unlink(outputPath);

        } catch (error) {
            console.error('TTS error:', error);
            message.reply('❌ Failed to generate speech.');
        }
    }
}

module.exports = TTSCommand; 