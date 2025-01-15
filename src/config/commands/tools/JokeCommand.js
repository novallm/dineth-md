const Command = require('../../structures/Command');
const axios = require('axios');

class JokeCommand extends Command {
    constructor() {
        super({
            name: 'joke',
            aliases: ['telljoke'],
            description: 'Get a random joke',
            category: 'tools',
            usage: '.joke'
        });
    }

    async execute(message) {
        await message.reply('😂 *Fetching a joke...*');

        try {
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
            const jokeText = `😂 *${response.data.setup}*\n🤣 *${response.data.punchline}*`;

            await message.reply(jokeText);

        } catch (error) {
            console.error('Joke error:', error);
            message.reply('❌ Failed to fetch a joke.');
        }
    }
}

module.exports = JokeCommand;