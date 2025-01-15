const Command = require('../../structures/Command');
const axios = require('axios');

class FactCommand extends Command {
    constructor() {
        super({
            name: 'fact',
            aliases: ['randomfact'],
            description: 'Get a random fact',
            category: 'tools',
            usage: '.fact'
        });
    }

    async execute(message) {
        await message.reply('🔍 *Fetching a random fact...*');

        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            const factText = `💡 *Did you know?*\n${response.data.text}`;

            await message.reply(factText);

        } catch (error) {
            console.error('Fact error:', error);
            message.reply('❌ Failed to fetch a fact.');
        }
    }
}

module.exports = FactCommand;