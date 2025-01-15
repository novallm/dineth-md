const Command = require('../../structures/Command');
const moment = require('moment');
const os = require('os');

class LiveStatsCommand extends Command {
    constructor() {
        super({
            name: 'stats',
            aliases: ['live', 'status'],
            description: 'Show live bot statistics',
            category: 'info'
        });
    }

    async execute(message) {
        const startTime = this.bot.startTime;
        const uptime = moment.duration(Date.now() - startTime);

        const statsText = `╭─❒ 『 LIVE STATISTICS 』 ❒
│
├─❒ ⏰ *Time & Date*
│ • ${moment().format('LLLL')}
│ • Uptime: ${uptime.humanize()}
│
├─❒ 🤖 *Bot Stats*
│ • Commands: ${this.bot.commands.size}
│ • Users: ${Object.keys(this.bot.store.users).length}
│ • Groups: ${Object.keys(this.bot.store.groups).length}
│
├─❒ 💻 *System Stats*
│ • RAM: ${this.formatBytes(os.totalmem() - os.freemem())}/${this.formatBytes(os.totalmem())}
│ • CPU: ${os.loadavg()[0].toFixed(2)}%
│ • Ping: ${await this.getPing()}ms
│
├─❒ 📊 *Today's Activity*
│ • Messages: ${this.bot.stats.messages}
│ • Commands: ${this.bot.stats.commands}
│ • Media: ${this.bot.stats.media}
│
╰──────────────────❒`;

        await message.reply(statsText);

        // Update stats every minute
        setInterval(() => this.updateStats(message.key.remoteJid), 60000);
    }

    async getPing() {
        const start = Date.now();
        await this.bot.sendPresenceUpdate('available');
        return Date.now() - start;
    }

    formatBytes(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0B';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + sizes[i];
    }

    async updateStats(jid) {
        const statsUpdate = `*Live Update*\n` +
            `Time: ${moment().format('HH:mm:ss')}\n` +
            `Ping: ${await this.getPing()}ms\n` +
            `RAM: ${this.formatBytes(os.totalmem() - os.freemem())}`;

        await this.bot.sendMessage(jid, { text: statsUpdate });
    }
}

module.exports = LiveStatsCommand; 