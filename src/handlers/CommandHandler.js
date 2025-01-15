class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.cooldowns = new Map();
    }

    async handle(message) {
        const prefix = this.bot.config.prefix;
        
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = this.bot.commands.get(commandName);
        
        if (!command) return;

        // Check permissions
        if (!this.checkPermissions(message, command)) {
            return message.reply("You don't have permission to use this command.");
        }

        // Check cooldowns
        if (!this.checkCooldown(message, command)) {
            return message.reply("Please wait before using this command again.");
        }

        try {
            await command.execute(message, args);
            this.bot.stats.commandsExecuted++;
        } catch (error) {
            console.error(error);
            message.reply("There was an error executing that command.");
        }
    }

    checkPermissions(message, command) {
        // Permission checking logic
        return true;
    }

    checkCooldown(message, command) {
        // Cooldown checking logic
        return true;
    }
}

module.exports = CommandHandler; 