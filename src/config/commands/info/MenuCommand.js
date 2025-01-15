const Command = require('../../structures/Command');
const os = require('os');
const moment = require('moment-timezone');

class MenuCommand extends Command {
    constructor() {
        super({
            name: 'menu',
            aliases: ['help', 'cmd', 'list'],
            description: 'Display bot commands menu',
            category: 'info'
        });
    }

    async execute(message) {
        const uptime = this.formatUptime(process.uptime());
        const ram = this.formatRam();
        
        const menuText = `┌─〈 ➺『Dineth MD V1』 〉─◆
│╭─────────────···▸
┴│▸
❖│▸ ʀᴜɴᴛɪᴍᴇ : ${uptime}
❖│▸ ᴍᴏᴅᴇ : [public]
❖│▸ ᴘʀᴇғɪx : [.]
❖│▸ ʀᴀᴍ ᴜsᴇ : ${ram}
❖│▸ ɴᴀᴍᴇ ʙᴏᴛ : ❖『Dineth MD V1』❖
❖│▸ ᴄʀᴇᴀᴛᴏʀ : ➺Dineth Nethsara࿐
❖│▸ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ : [true]
❖│▸ ᴠᴇʀsɪᴏɴs : ᴠ.1.0.0
┬│▸
└──────────────···▸

♡︎•━━━━━━☻︎━━━━━━•♡︎

🧞‍♂️
╭────❒⁠⁠⁠⁠ 📥 DOWNLOADER-CMD 📥 ❒⁠⁠⁠⁠ 
┋ .ғʙ - Facebook video downloader
┋ .ɪɴꜱᴛᴀ - Instagram downloader
┋ .ᴠɪᴅᴇᴏ - YouTube video downloader
┋ .ɢᴅʀɪᴠᴇ - Google Drive downloader
┋ .ᴛᴡɪᴛᴛᴇʀ - Twitter video downloader
┋ .ᴛᴛ - TikTok video downloader
┋ .ᴍᴇᴅɪᴀғɪʀᴇ - Mediafire downloader
┋ .ꜱᴏɴɢ - Music downloader
┋ .ᴘʟᴀʏ - Play YouTube audio
┋ .ᴠɪᴅᴇᴏ2 - Alternative video downloader
┋ .sᴘᴏᴛɪꜰʏ - Spotify downloader
┋ .ᴠɪᴅᴇᴏ4 - HD video downloader
┋ .ɪᴍɢ - Image downloader
┋ .Lʏʀɪᴄs - Find song lyrics
┋ .ᴀᴘᴋ - APK downloader
┋ .ᴅᴀʀᴀᴍᴀ - Drama downloader
┋ .ᴘʟᴀʏ2 - Alternative music player
┋ .ᴘʟᴀʏ4 - Premium music player
┋ .ʙᴀɪsᴄᴏᴘᴇ - Movie downloader
┋ .ɢɪɴɪsɪsɪʟᴀ - Special content downloader
┕───────────────────❒

🧞‍♂️
╭────❒⁠⁠⁠⁠ 🏮 DINETH EMPIRE 🏮 ❒⁠⁠⁠⁠ 
┋ .Fᴀᴍɪʟʏ - View bot family
┋ .Vᴀᴡᴜʟᴇɴᴄᴇ - Special features
┋ .ᴄʜᴀɴɴᴇʟ - Official channels
┋ .ꜱᴜᴘᴘᴏʀᴛ - Get support
┕───────────────────❒

🧞‍♂️
╭────❒⁠⁠⁠⁠ 🎮 GAMES & FUN 🎮 ❒⁠⁠⁠⁠ 
┋ .ᴛʀᴜᴛʜ - Truth questions
┋ .ᴅᴀʀᴇ - Dare challenges
┋ .ꜱʟᴏᴛ - Slot machine
┋ .ᴄʜᴇꜱꜱ - Play chess
┋ .ᴛɪᴄᴛᴀᴄᴛᴏᴇ - Play TicTacToe
┕───────────────────❒

[... continues with all categories ...]

📱 Join Our Channel:
https://whatsapp.com/channel/dinethmd

> POWERED BY DINETH MD
╘✦•·········•••••••••············•✦`;

        await message.reply(menuText);
    }

    formatUptime(uptime) {
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }

    formatRam() {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        const total = os.totalmem() / 1024 / 1024;
        return `${used.toFixed(2)}MB / ${total.toFixed(0)}MB`;
    }
}

module.exports = MenuCommand; 