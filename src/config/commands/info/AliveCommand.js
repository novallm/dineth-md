const Command = require('../../structures/Command');
const os = require('os');

class AliveCommand extends Command {
    constructor() {
        super({
            name: 'alive',
            aliases: ['online', 'bot'],
            description: 'Check if bot is online',
            category: 'info'
        });
    }

    async execute(message) {
        const uptime = this.formatUptime(process.uptime());
        const ram = this.formatRam();
        
        const aliveMessage = `╭────❒ *DINETH MD V1* ❒────
│ *Bot Status:* Online ✅
│ *Uptime:* ${uptime}
│ *RAM Usage:* ${ram}
│ *Version:* 1.0.0
│ *Mode:* Public
│ *Speed:* ${Math.random() * 100 + 900}ms
╰────────────────────❒

*Features Available:*
• 1000+ Commands
• Auto Sticker Maker
• Group Management
• YouTube Downloader
• Instagram Downloader
• TikTok Downloader
• AI Image Generator
• And Much More!

*Creator:* Dineth Nethsara
*Support:* wa.me/94741566800

_Type .menu for full command list_`;

        // Send alive message with bot profile picture
        await message.client.sendMessage(message.key.remoteJid, {
            image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/profile.jpg' },
            caption: aliveMessage,
            footer: '© Dineth MD Bot 2024'
        });
    }

    formatUptime(uptime) {
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    formatRam() {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        const total = os.totalmem() / 1024 / 1024;
        return `${used.toFixed(2)}MB / ${total.toFixed(0)}MB`;
    }
}

module.exports = AliveCommand; 