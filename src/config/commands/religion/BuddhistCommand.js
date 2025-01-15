const Command = require('../../structures/Command');
const axios = require('axios');

class BuddhistCommand extends Command {
    constructor() {
        super({
            name: 'buddhist',
            aliases: ['buddha', 'dhamma'],
            description: 'Buddhist teachings and quotes',
            category: 'religion',
            usage: '.buddhist <sutra/quote/teaching>'
        });
    }

    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase() || 'quote';

        const header = `╭─❒ 『 BUDDHIST TEACHINGS 』 ❒
│ 🙏 *Peace & Wisdom* 🕉️
╰──────────────────❒\n\n`;

        try {
            switch (subcommand) {
                case 'quote':
                    const quote = await this.getBuddhistQuote();
                    await message.reply(header + quote);
                    break;

                case 'sutra':
                    const sutra = await this.getSutra(args.slice(1).join(' '));
                    await message.reply(header + sutra);
                    break;

                case 'teaching':
                    const teaching = this.getTeaching();
                    await message.reply(header + teaching);
                    break;

                case 'meditation':
                    const meditation = this.getMeditationGuide();
                    await message.reply(header + meditation);
                    break;

                default:
                    await message.reply(`${header}Available Commands:
• .buddhist quote - Random Buddhist quote
• .buddhist sutra - Read Buddhist sutras
• .buddhist teaching - Buddhist teachings
• .buddhist meditation - Meditation guide`);
            }
        } catch (error) {
            console.error('Buddhist command error:', error);
            message.reply('❌ Error fetching Buddhist content.');
        }
    }

    async getBuddhistQuote() {
        const quotes = [
            "Peace comes from within. Do not seek it without.",
            "The mind is everything. What you think you become.",
            "Three things cannot be long hidden: the sun, the moon, and the truth.",
            // Add more quotes
        ];
        return `📿 *Quote of the Moment*\n\n${quotes[Math.floor(Math.random() * quotes.length)]}`;
    }

    async getSutra(name) {
        // Implement sutra fetching logic
        return "Sutra content...";
    }

    getTeaching() {
        return `🌟 *The Four Noble Truths*

1. The Truth of Suffering (Dukkha)
2. The Truth of the Cause of Suffering (Samudāya)
3. The Truth of the End of Suffering (Nirodha)
4. The Truth of the Path to the End of Suffering (Magga)

🌸 *The Noble Eightfold Path*
1. Right View
2. Right Intention
3. Right Speech
4. Right Action
5. Right Livelihood
6. Right Effort
7. Right Mindfulness
8. Right Concentration`;
    }

    getMeditationGuide() {
        return `🧘‍♂️ *Basic Meditation Guide*

1. Find a quiet place
2. Sit comfortably
3. Close your eyes
4. Focus on your breath
5. Let thoughts pass without judgment
6. Start with 5-10 minutes
7. Practice regularly

Type .meditation for guided session`;
    }
}

module.exports = BuddhistCommand; 