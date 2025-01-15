const Command = require('../../structures/Command');
const moment = require('moment');

class ReminderCommand extends Command {
    constructor() {
        super({
            name: 'remind',
            aliases: ['reminder', 'remindme'],
            description: 'Set reminders',
            category: 'utility',
            usage: '.remind <time> <message>'
        });
    }

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply(`*Reminder Usage*
.remind 1h Check email
.remind 30m Call mom
.remind 24h Birthday party

Time units: s (seconds), m (minutes), h (hours), d (days)`);
        }

        const timeStr = args[0].toLowerCase();
        const reminder = args.slice(1).join(' ');

        try {
            const duration = this.parseDuration(timeStr);
            if (!duration) return message.reply('Invalid time format!');

            const triggerTime = moment().add(duration, 'milliseconds');
            
            message.reply(`⏰ Reminder set for ${triggerTime.format('LLL')}\n\n${reminder}`);

            // Set timeout for reminder
            setTimeout(async () => {
                await message.client.sendMessage(message.key.remoteJid, {
                    text: `⏰ *REMINDER*\n\n${reminder}\n\n_Set ${duration / 3600000} hours ago_`
                });
            }, duration);

        } catch (error) {
            console.error('Reminder error:', error);
            message.reply('❌ Failed to set reminder!');
        }
    }

    parseDuration(timeStr) {
        const unit = timeStr.slice(-1);
        const value = parseInt(timeStr.slice(0, -1));
        
        if (isNaN(value)) return null;

        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60000;
            case 'h': return value * 3600000;
            case 'd': return value * 86400000;
            default: return null;
        }
    }
}

module.exports = ReminderCommand; 