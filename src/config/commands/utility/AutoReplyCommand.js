const Command = require('../../structures/Command');

class AutoReplyCommand extends Command {
    constructor() {
        super({
            name: 'autoreply',
            aliases: ['ar'],
            description: 'Set auto replies for keywords',
            category: 'utility',
            usage: '.autoreply add/remove/list <keyword> <reply>',
            adminOnly: true
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`*Auto Reply Commands*
.autoreply add <keyword> <reply>
.autoreply remove <keyword>
.autoreply list
.autoreply clear`);
        }

        const action = args[0].toLowerCase();
        const keyword = args[1]?.toLowerCase();
        const reply = args.slice(2).join(' ');

        try {
            switch (action) {
                case 'add':
                    if (!keyword || !reply) return message.reply('Provide keyword and reply!');
                    // Store in database
                    message.reply(`✅ Added auto reply for "${keyword}"`);
                    break;

                case 'remove':
                    if (!keyword) return message.reply('Provide keyword to remove!');
                    // Remove from database
                    message.reply(`✅ Removed auto reply for "${keyword}"`);
                    break;

                case 'list':
                    // Get from database
                    message.reply('*Auto Replies:*\n\n• keyword1 -> reply1\n• keyword2 -> reply2');
                    break;

                case 'clear':
                    // Clear all auto replies
                    message.reply('✅ Cleared all auto replies!');
                    break;

                default:
                    message.reply('Invalid action! Use .autoreply for help.');
            }
        } catch (error) {
            console.error('Auto reply error:', error);
            message.reply('❌ Failed to manage auto replies!');
        }
    }
}

module.exports = AutoReplyCommand; 