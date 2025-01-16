class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.cooldowns = new Map();
        this.aliases = new Map();
        this.categories = new Map();
        this.initializeCommands();
    }

    async initializeCommands() {
        // Admin Commands
        this.registerCommand({
            name: 'ban',
            category: 'admin',
            description: 'Ban a user from using the bot',
            usage: '!ban @user reason',
            cooldown: 10,
            permissions: ['admin'],
            execute: async (message, args) => {
                const user = message.mentions[0];
                if (!user) return 'Please mention a user to ban';
                await this.bot.security.addToBlacklist(user);
                return `User ${user} has been banned`;
            }
        });

        // Group Commands
        this.registerCommand({
            name: 'kick',
            category: 'group',
            description: 'Kick a user from the group',
            usage: '!kick @user',
            cooldown: 5,
            permissions: ['admin', 'moderator'],
            execute: async (message, args) => {
                return await this.bot.group.removeParticipant(message.chat, message.mentions[0]);
            }
        });

        // Fun Commands
        this.registerCommand({
            name: 'sticker',
            category: 'fun',
            description: 'Convert image to sticker',
            usage: '!sticker',
            cooldown: 10,
            execute: async (message) => {
                if (!message.hasMedia) return 'Please send an image';
                return await this.bot.media.createSticker(message);
            }
        });

        // Utility Commands
        this.registerCommand({
            name: 'translate',
            category: 'utility',
            description: 'Translate text to another language',
            usage: '!translate <lang> <text>',
            cooldown: 5,
            execute: async (message, args) => {
                const [lang, ...text] = args;
                return await this.bot.ai.translateText(text.join(' '), lang);
            }
        });

        // AI Commands
        this.registerCommand({
            name: 'ai',
            category: 'ai',
            description: 'Chat with AI',
            usage: '!ai <message>',
            cooldown: 10,
            execute: async (message, args) => {
                return await this.bot.ai.processMessage(args.join(' '));
            }
        });

        // Media Commands
        this.registerCommand({
            name: 'ytdl',
            category: 'media',
            description: 'Download YouTube video',
            usage: '!ytdl <url>',
            cooldown: 30,
            execute: async (message, args) => {
                return await this.bot.media.downloadYouTube(args[0]);
            }
        });
    }

    registerCommand(command) {
        this.commands.set(command.name, command);
        
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name);
            });
        }

        if (!this.categories.has(command.category)) {
            this.categories.set(command.category, []);
        }
        this.categories.get(command.category).push(command.name);
    }

    async handleCommand(message) {
        const prefix = '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = this.resolveCommand(commandName);

        if (!command) return;

        if (!await this.validateCommand(message, command)) {
            return 'You do not have permission to use this command';
        }

        if (!await this.checkCooldown(message.sender, command)) {
            return 'Please wait before using this command again';
        }

        try {
            return await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command ${command.name}:`, error);
            return 'An error occurred while executing the command';
        }
    }

    resolveCommand(name) {
        return this.commands.get(name) || this.commands.get(this.aliases.get(name));
    }

    async validateCommand(message, command) {
        if (!command.permissions) return true;
        
        const userPermissions = await this.bot.database.getUserPermissions(message.sender);
        return command.permissions.some(permission => userPermissions.includes(permission));
    }

    async checkCooldown(userId, command) {
        if (!command.cooldown) return true;

        const key = `${userId}-${command.name}`;
        const cooldown = this.cooldowns.get(key);
        const now = Date.now();

        if (cooldown && now < cooldown) {
            return false;
        }

        this.cooldowns.set(key, now + (command.cooldown * 1000));
        return true;
    }

    getCommandHelp(command) {
        return {
            name: command.name,
            description: command.description,
            usage: command.usage,
            category: command.category,
            cooldown: command.cooldown,
            permissions: command.permissions
        };
    }

    getCommandsByCategory(category) {
        return this.categories.get(category) || [];
    }

    getAllCategories() {
        return Array.from(this.categories.keys());
    }
}

module.exports = CommandHandler;