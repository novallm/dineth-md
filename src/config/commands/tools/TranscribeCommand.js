const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs').promises;
const path = require('path');

class TranscribeCommand extends Command {
    constructor() {
        super({
            name: 'transcribe',
            description: 'Convert audio to text',
            category: 'tools',
            usage: '.transcribe <reply to audio>'
        });

        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));
    }

    async execute(message) {
        const quoted = message.quoted;
        if (!quoted || !quoted.message?.audioMessage) {
            return message.reply('Please reply to an audio message!');
        }

        await message.reply('🎯 *Transcribing audio...*');

        try {
            const buffer = await downloadMediaMessage(quoted, 'buffer');
            const audioPath = path.join(__dirname, `../../../temp/${Date.now()}.mp3`);
            await fs.writeFile(audioPath, buffer);

            const transcript = await this.openai.createTranscription(
                fs.createReadStream(audioPath),
                'whisper-1'
            );

            await message.reply(`📝 *Transcription:*\n\n${transcript.data.text}`);
            await fs.unlink(audioPath);

        } catch (error) {
            console.error('Transcription error:', error);
            message.reply('❌ Failed to transcribe audio.');
        }
    }
}

module.exports = TranscribeCommand; 