const Command = require('../../structures/Command');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class LogoMakerCommand extends Command {
    constructor() {
        super({
            name: 'logo',
            aliases: ['makelogo', 'textlogo'],
            description: 'Create custom logos',
            category: 'tools',
            usage: '.logo <style> <text>'
        });

        this.styles = {
            neon: 'neon-light',
            galaxy: 'galaxy-style',
            metal: 'metallic-3d',
            gold: 'gold-effect',
            matrix: 'matrix-style',
            thunder: 'thunder-effect',
            graffiti: 'graffiti-art'
        };
    }

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply(`╭─❒ 『 LOGO MAKER 』 ❒
│
├─❒ 🎨 *Styles:*
│ • neon
│ • galaxy
│ • metal
│ • gold
│ • matrix
│ • thunder
│ • graffiti
│
├─❒ 📝 *Usage:*
│ .logo <style> <text>
│
├─❒ 📌 *Example:*
│ .logo neon Dineth
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const style = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (!this.styles[style]) {
            return message.reply('❌ Invalid logo style!');
        }

        await message.reply('🎨 *Creating your logo...*');

        try {
            const response = await axios.get(`https://api.lolhuman.xyz/api/textprome/${this.styles[style]}`, {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY,
                    text: text
                },
                responseType: 'arraybuffer'
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: Buffer.from(response.data),
                caption: `✨ Style: ${style}\nText: ${text}\nCreated by Dineth MD`
            });

        } catch (error) {
            console.error('Logo creation error:', error);
            message.reply('❌ Failed to create logo.');
        }
    }
}

module.exports = LogoMakerCommand; 