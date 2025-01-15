const Command = require('../../structures/Command');

class MuteCommand extends Command {
    constructor() {
        super({
            name: 'mute',
            description: 'Mute users or group',
            category: 'group',
            usage: '.mute <@user/time>',
            groupOnly: true,
            adminOnly: true
        });
    }

    async execute(message, args) {
        try {
            if (!args.length) {
                // Mute entire group
                await message.client.groupSettingUpdate(message.key.remoteJid, 'announcement');
                return message.reply('🔇 Group has been muted. Only admins can send messages.');
            }

            // Mute specific user
            const mentioned = message.mentions[0];
            if (!mentioned) {
                return message.reply('❌ Please mention a user to mute!');
            }

            const duration = args[1] ? this.parseDuration(args[1]) : 3600000; // Default 1 hour
            const mutedUntil = Date.now() + duration;

            // Store muted user in database
            await this.bot.db.set(`muted.${message.key.remoteJid}.${mentioned}`, mutedUntil);

            await message.reply(`🔇 @${mentioned.split('@')[0]} has been muted for ${this.formatDuration(duration)}`, {
                mentions: [mentioned]
            });

            // Automatically unmute after duration
            setTimeout(async () => {
                await this.bot.db.delete(`muted.${message.key.remoteJid}.${mentioned}`);
                await message.client.sendMessage(message.key.remoteJid, {
                    text: `🔊 @${mentioned.split('@')[0]} has been unmuted.`,
                    mentions: [mentioned]
                });
            }, duration);

        } catch (error) {
            console.error('Mute error:', error);
            message.reply('❌ Failed to mute user.');
        }
    }

    parseDuration(time) {
        const unit = time.slice(-1);
        const value = parseInt(time.slice(0, -1));
        
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60000;
            case 'h': return value * 3600000;
            case 'd': return value * 86400000;
            default: return 3600000;
        }
    }

    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
}

module.exports = MuteCommand;  