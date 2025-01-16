const Command = require('../../../structures/Command');

class ReminderCommand extends Command {
    constructor(bot) {
        super(bot, {
            name: 'reminder',
            description: 'Set and manage reminders',
            usage: '.reminder <add|list|remove> [options]',
            aliases: ['remind'],
            category: 'utility'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return await this.bot.sendText(message.key.remoteJid, 'Usage: .reminder <add|list|remove> [options]');
        }

        const subCommand = args[0].toLowerCase();
        switch (subCommand) {
            case 'add':
                return await this.handleAdd(message, args.slice(1));
            case 'list':
                return await this.handleList(message);
            case 'remove':
                return await this.handleRemove(message, args[1]);
            default:
                return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: add, list, remove');
        }
    }

    async handleAdd(message, args) {
        if (args.length < 2) {
            return await this.bot.sendText(message.key.remoteJid, 'Usage: .reminder add <time> <message> [recurring?]');
        }

        const timeStr = args[0];
        const recurring = args[args.length - 1].toLowerCase() === 'recurring';
        const reminderText = args.slice(1, recurring ? -1 : undefined).join(' ');

        try {
            const time = this.parseTime(timeStr);
            const id = await this.bot.reminderHandler.addReminder(
                message.key.remoteJid,
                reminderText,
                time,
                recurring
            );

            return await this.bot.sendText(
                message.key.remoteJid,
                `Reminder set for ${time.toLocaleString()}${recurring ? ' (recurring)' : ''}\nID: ${id}`
            );
        } catch (error) {
            return await this.bot.sendText(message.key.remoteJid, `Failed to set reminder: ${error.message}`);
        }
    }

    async handleList(message) {
        const reminders = this.bot.reminderHandler.listReminders(message.key.remoteJid);
        if (!reminders.length) {
            return await this.bot.sendText(message.key.remoteJid, 'No active reminders');
        }

        const reminderList = reminders
            .map(r => `ID: ${r.id}\nMessage: ${r.message}\nTime: ${new Date(r.time).toLocaleString()}\nRecurring: ${r.recurring ? 'Yes' : 'No'}`)
            .join('\n\n');

        return await this.bot.sendText(message.key.remoteJid, `Your reminders:\n\n${reminderList}`);
    }

    async handleRemove(message, id) {
        if (!id) {
            return await this.bot.sendText(message.key.remoteJid, 'Usage: .reminder remove <id>');
        }

        const removed = await this.bot.reminderHandler.removeReminder(id);
        return await this.bot.sendText(
            message.key.remoteJid,
            removed ? `Reminder ${id} removed` : `No reminder found with ID ${id}`
        );
    }

    parseTime(timeStr) {
        // Support various time formats
        if (timeStr.match(/^\d+[mhd]$/)) {
            const value = parseInt(timeStr);
            const unit = timeStr.slice(-1);
            const multiplier = {
                'm': 60000,
                'h': 3600000,
                'd': 86400000
            }[unit];
            return new Date(Date.now() + value * multiplier);
        }

        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid time format. Use ISO date or duration (e.g., 30m, 2h, 1d)');
        }
        return date;
    }
}

module.exports = ReminderCommand;