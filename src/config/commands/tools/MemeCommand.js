const Command = require('../../structures/Command');
const axios = require('axios');

class MemeCommand extends Command {
    constructor() {
        super({
            name: 'meme',
            aliases: ['randommeme'],
            description: 'Get a random meme',
            category: 'tools',
            usage: '.meme'
        });
    }

    async execute(message) {
        await message.reply('📸 *Fetching a random meme...*');

        try {
            const response = await axios.get('https://meme-api.herokuapp.com/gimme');
            const memeImageUrl = response.data.url;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: memeImageUrl },
                caption: '📸✨ Here is your random meme!'
            });

        } catch (error) {
            console.error('Meme error:', error);
            message.reply('❌ Failed to fetch a meme.');
        }
    }
}

module.exports = MemeCommand;