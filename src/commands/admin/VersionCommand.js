const Command = require('../../structures/Command');

class VersionCommand extends Command {
    constructor() {
        super({
            name: 'version',
            aliases: ['ver', 'v'],
            description: 'Check bot version and updates',
            category: 'admin',
            usage: '.version'
        });
    }

    async execute(message, args) {
        const versionInfo = await this.bot.versionHandler.checkForUpdates();
        
        const versionText = `╭─❒ 『 BOT VERSION 』 ❒
│
├─❒ 🤖 *Current Version:* ${this.bot.versionHandler.currentVersion}
├─❒ 🔄 *Latest Version:* ${versionInfo.latestVersion || 'Unknown'}
├─❒ 📡 *Update Channel:* ${this.bot.versionHandler.updateChannel}
│
${versionInfo.hasUpdate ? `├─❒ ⚠️ *Update Available!*
├─❒ Type .update to update the bot
│` : '├─❒ ✅ Bot is up to date\n│'}
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

        await message.reply(versionText);
    }
}

module.exports = VersionCommand; 