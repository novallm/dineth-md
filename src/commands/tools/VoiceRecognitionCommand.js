const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');
const speech = require('@google-cloud/speech');

class VoiceRecognitionCommand extends Command {
    constructor() {
        super({
            name: 'recognize',
            aliases: ['vcr', 'speech'],
            description: 'Convert voice message to text',
            category: 'tools',
            usage: '.recognize <reply to voice message>'
        });
        
        this.client = new speech.SpeechClient();
    }

    async execute(message) {
        if (!message.quoted || !message.quoted.message?.audioMessage) {
            return message.reply('Please reply to a voice message!');
        }

        await message.reply('🎤 *Recognizing speech...*');

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const audioBytes = Readable.from(buffer);

            const config = {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
            };

            const audio = {
                content: audioBytes,
            };

            const request = {
                audio: audio,
                config: config,
            };

            const [response] = await this.client.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            await message.reply(`📝 *Transcription:*\n${transcription}`);

        } catch (error) {
            console.error('Speech recognition error:', error);
            message.reply('❌ Failed to recognize speech.');
        }
    }
}

module.exports = VoiceRecognitionCommand; 