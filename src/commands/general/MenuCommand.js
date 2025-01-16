const Command = require('../../structures/Command');

class MenuCommand extends Command {
    constructor() {
        super({
            name: 'menu',
            aliases: ['help', 'cmd', 'commands'],
            description: 'Show bot commands menu',
            category: 'general',
            usage: '.menu'
        });
    }

    async execute(message, args) {
        const menuText = `╭─❒ 『 DINETH MD MENU 』 ❒
│
├─❒ 🤖 *Bot Info*
│ • Creator: Dineth Nethsara
│ • Version: 1.0.0
│
├─❒ 📥 *Downloader*
│ • .ytdl <url> - YouTube
│ • .tiktok <url> - TikTok
│ • .ig <url> - Instagram
│ • .fb <url> - Facebook
│ • .twitter <url> - Twitter
│
├─❒ 🎨 *Converter*
│ • .sticker - Create sticker
│ • .toimg - Sticker to image
│ • .removebg - Remove background
│ • .compress - Compress image
│
├─❒ 🤖 *AI Tools*
│ • .ai <prompt> - ChatGPT
│ • .imagine <prompt> - AI Art
│ • .translate <lang> <text>
│ • .ocr - Extract text
│
├─❒ 📊 *Tools*
│ • .weather <city>
│ • .news <category>
│ • .dict <word>
│ • .calc <expression>
│ • .qr <text>
│ • .ss <url>
│
├─❒ 🎮 *Fun & Games*
│ • .joke - Random joke
│ • .quote - Random quote
│ • .fact - Random fact
│ • .meme - Random meme
│
├─❒ 👥 *Group*
│ • .kick @user
│ • .add @user
│ • .promote @user
│ • .demote @user
│ • .groupinfo
│
├─❒ ⚙️ *Settings*
│ • .setprefix
│ • .setwelcome
│ • .setgoodbye
│ • .antilink on/off
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

        await message.reply(menuText);
    }
}

module.exports = MenuCommand; 