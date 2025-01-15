const Command = require('../../structures/Command');
const axios = require('axios');

class GirlChatCommand extends Command {
    constructor() {
        super({
            name: 'girl',
            aliases: ['gf', 'girlfriend'],
            description: 'Chat with an AI girlfriend',
            category: 'fun'
        });

        this.personalities = {
            cute: '🌸 Cute and sweet girlfriend who loves anime and cute things',
            cool: '😎 Cool and confident girlfriend who loves music and fashion',
            caring: '💖 Caring and supportive girlfriend who always listens'
        };
    }

    async execute(message, args) {
        const personality = args[0]?.toLowerCase() || 'cute';
        const text = args.slice(1).join(' ');

        if (!text) {
            return message.reply(`╭─❒ 『 GIRLFRIEND CHAT 』 ❒
│
├─❒ 💝 *Choose Personality:*
${Object.entries(this.personalities).map(([id, desc]) => `│ • ${id} - ${desc}`).join('\n')}
│
├─❒ 📝 *Usage:*
│ .girl <personality> <message>
│
╰──────────────────❒`);
        }

        await message.reply('💭 *Thinking...*');

        try {
            // Using free AI API
            const response = await axios.post('https://api.simsimi.net/v2/', {
                text: text,
                lc: 'en',
                name: 'Girlfriend',
                personality: this.personalities[personality] || this.personalities.cute
            });

            const reply = `╭─❒ 『 GIRLFRIEND 』 ❒
│
├─❒ 💌 *Message:*
│ ${text}
│
├─❒ 💝 *Reply:*
│ ${response.data.success}
│
╰──────────────────❒`;

            await message.reply(reply);
        } catch (error) {
            console.error('Girlfriend chat error:', error);
            message.reply('❌ Sorry, I\'m not feeling well right now.');
        }
    }
}

module.exports = GirlChatCommand; 