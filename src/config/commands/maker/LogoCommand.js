const Command = require('../../structures/Command');
const axios = require('axios');

class LogoCommand extends Command {
    constructor() {
        super({
            name: 'logo',
            aliases: ['makelogo', 'textpro'],
            description: 'Create text logos',
            category: 'maker',
            usage: '.logo <style> <text>'
        });

        this.styles = {
            neon: 'neon-light-effect',
            galaxy: 'galaxy-style-text',
            fire: 'fire-text-effect',
            metal: 'metal-text-effect',
            gold: 'gold-text-effect',
            matrix: 'matrix-text-effect',
            thunder: 'thunder-text-effect',
            purple: 'purple-style-text',
            water: 'water-3d-text',
            carbon: 'carbon-text-effect'
        };
    }

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply(`❌ Please use format: .logo <style> <text>

Available Styles:
${Object.keys(this.styles).map(style => `• ${style}`).join('\n')}`);
        }

        const style = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (!this.styles[style]) {
            return message.reply('❌ Invalid style! Use .logo to see available styles.');
        }

        await message.reply('🎨 *Creating your logo...*');

        try {
            const response = await axios.get(`https://photooxy.com/api/v1/${this.styles[style]}`, {
                params: {
                    text: text,
                    apikey: process.env.PHOTOOXY_API_KEY
                },
                responseType: 'arraybuffer'
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: Buffer.from(response.data),
                caption: `✨ *Logo Generator*\n\n` +
                        `Style: ${style}\n` +
                        `Text: ${text}\n\n` +
                        `Created by Dineth MD`
            });
        } catch (error) {
            console.error('Logo creation error:', error);
            message.reply('❌ Failed to create logo. Please try again.');
        }
    }
}

module.exports = LogoCommand; 