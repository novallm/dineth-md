const Command = require('../../structures/Command');
const axios = require('axios');

class DogCommand extends Command {
    constructor() {
        super({
            name: 'dog',
            aliases: ['randomdog'],
            description: 'Get a random dog image',
            category: 'tools',
            usage: '.dog'
        });
    }

    async execute(message) {
        await message.reply('🐶 *Fetching a random dog image...*');

        try {
            const response = await axios.get('https://dog.ceo/api/breeds/image/random');
            const dogImageUrl = response.data.message;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: dogImageUrl },
                caption: '🐶✨ Here is your random dog!'
            });

        } catch (error) {
            console.error('Dog image error:', error);
            message.reply('❌ Failed to fetch a dog image.');
        }
    }
}

module.exports = DogCommand;