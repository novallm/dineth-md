const Command = require('../../structures/Command');
const axios = require('axios');

class CatCommand extends Command {
    constructor() {
        super({
            name: 'cat',
            aliases: ['randomcat'],
            description: 'Get a random cat image',
            category: 'tools',
            usage: '.cat'
        });
    }

    async execute(message) {
        await message.reply('🐱 *Fetching a random cat image...*');

        try {
            const response = await axios.get('https://api.thecatapi.com/v1/images/search');
            const catImageUrl = response.data[0].url;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: catImageUrl },
                caption: '🐱✨ Here is your random cat!'
            });

        } catch (error) {
            console.error('Cat image error:', error);
            message.reply('❌ Failed to fetch a cat image.');
        }
    }
}

module.exports = CatCommand;