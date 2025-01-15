const Command = require('../../structures/Command');
const axios = require('axios');

class ArtCommand extends Command {
    constructor() {
        super({
            name: 'art',
            aliases: ['draw', 'create'],
            description: 'Generate AI art',
            category: 'fun'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 AI ART GENERATOR 』 ❒
│
├─❒ 🎨 *Styles:*
│ • anime - Anime style
│ • realistic - Photo realistic
│ • cartoon - Cartoon style
│ • digital - Digital art
│
├─❒ 📝 *Usage:*
│ .art <style> <description>
│
╰──────────────────❒`);
        }

        const style = args[0].toLowerCase();
        const prompt = args.slice(1).join(' ');

        await message.reply('🎨 *Creating your art...*');

        try {
            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: `${style} style: ${prompt}`,
                n: 1,
                size: '512x512'
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: response.data.data[0].url },
                caption: `🎨 *AI Generated Art*\n\nPrompt: ${prompt}\nStyle: ${style}`
            });
        } catch (error) {
            console.error('Art generation error:', error);
            message.reply('❌ Failed to generate art. Please try again.');
        }
    }
}

module.exports = ArtCommand; 