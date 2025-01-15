const Command = require('../../structures/Command');
const axios = require('axios');

class AiArtCommand extends Command {
    constructor() {
        super({
            name: 'aiart',
            description: 'Generate AI art using DALL-E',
            category: 'tools',
            usage: '.aiart <prompt>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a description for the art!');
        }

        const prompt = args.join(' ');
        await message.reply('🎨 *Generating your art...*');

        try {
            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: prompt,
                n: 1,
                size: '1024x1024'
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: response.data.data[0].url },
                caption: `🎨 *AI Generated Art*\n\nPrompt: ${prompt}`
            });

        } catch (error) {
            console.error('AI art generation error:', error);
            message.reply('❌ Failed to generate art. Please try again.');
        }
    }
}

module.exports = AiArtCommand; 