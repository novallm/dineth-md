const Command = require('../../structures/Command');

class ColorCommand extends Command {
    constructor() {
        super({
            name: 'color',
            aliases: ['randomcolor'],
            description: 'Get a random color with its hex code',
            category: 'tools',
            usage: '.color'
        });
    }

    async execute(message) {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        await message.reply(`🎨 *Random Color:* ${randomColor}`);
    }
}

module.exports = ColorCommand;