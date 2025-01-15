const Command = require('../../structures/Command');

class PollCommand extends Command {
    constructor() {
        super({
            name: 'poll',
            description: 'Create a poll in the group',
            category: 'group',
            usage: '!poll <question> | <option1> | <option2> | ...',
            groupOnly: true
        });
    }

    async execute(message, args) {
        const fullText = args.join(' ');
        const [question, ...options] = fullText.split('|').map(item => item.trim());

        if (!question || options.length < 2) {
            return message.reply(
                'Please provide a question and at least 2 options!\n' +
                'Example: !poll Which is better? | Pizza | Burger'
            );
        }

        try {
            const buttons = options.map((option, index) => ({
                buttonId: `poll_${index}`,
                buttonText: { displayText: option },
                type: 1
            }));

            const pollMessage = {
                text: `📊 *Poll:* ${question}\n\n` +
                    options.map((opt, i) => `${i + 1}. ${opt}`).join('\n'),
                footer: 'Click a button to vote!',
                buttons: buttons,
                headerType: 1
            };

            await message.client.sendMessage(message.key.remoteJid, pollMessage);
        } catch (error) {
            console.error('Poll creation error:', error);
            message.reply('❌ Failed to create poll.');
        }
    }
}

module.exports = PollCommand; 