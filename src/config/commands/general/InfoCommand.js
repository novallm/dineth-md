const Command = require('../../structures/Command');

class InfoCommand extends Command {
    constructor() {
        super({
            name: 'info',
            description: 'Shows bot information',
            category: 'general',
            usage: '!info'
        });
    }

    async execute(message) {
        const bot = message.client;
        const uptime = bot.getUptime();
        const memory = bot.getMemoryUsage();

        const infoText = `🤖 *${bot.config.botName}*\n\n` +
            `👑 Creator: ${bot.config.creator}\n` +
            `⚡ Version: ${bot.config.version}\n` +
            `⏱️ Uptime: ${uptime}\n` +
            `💾 RAM Usage: ${memory.heapUsed}\n` +
            `📊 Messages Processed: ${bot.stats.messagesProcessed}\n` +
            `🎯 Commands Executed: ${bot.stats.commandsExecuted}`;

        await bot.sendText(message.key.remoteJid, infoText);
    }
}

module.exports = InfoCommand; 