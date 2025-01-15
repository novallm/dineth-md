const Command = require('../../structures/Command');

class MenuCommand extends Command {
    constructor() {
        super({
            name: 'menu',
            aliases: ['help', 'list'],
            description: 'Show bot commands menu',
            category: 'general'
        });
    }

    async execute(message, args) {
        const category = args[0]?.toLowerCase();

        const mainMenu = `╭─❒ 『 DINETH MD BOT 』 ❒
│
├─❒ 👥 *GROUP MENU*
│ • .group - Group management
│ • .admin - Admin commands
│ • .kick - Remove member
│ • .add - Add member
│ • .promote - Make admin
│ • .demote - Remove admin
│
├─❒ 🎮 *GAMES MENU*
│ • .rpg - RPG adventure
│ • .quiz - Knowledge quiz
│ • .word - Word games
│ • .math - Math games
│ • .truth - Truth or dare
│
├─❒ 📥 *DOWNLOADER*
│ • .yt - YouTube
│ • .tiktok - TikTok
│ • .ig - Instagram
│ • .fb - Facebook
│ • .song - Music
│
├─❒ 🛠️ *TOOLS MENU*
│ • .sticker - Make sticker
│ • .toimg - Sticker to image
│ • .translate - Translator
│ • .calc - Calculator
│ • .weather - Weather info
│
├─❒ 🎨 *FUN MENU*
│ • .girl - AI girlfriend
│ • .art - AI art
│ • .meme - Random memes
│ • .joke - Random jokes
│ • .quote - Quotes
│
├─❒ 📊 *INFO MENU*
│ • .stats - Bot stats
│ • .ping - Bot speed
│ • .owner - Contact owner
│ • .donate - Support bot
│
├─❒ 🔰 *BOT INFO*
│ • Owner: Dineth Nethsara
│ • Prefix: .
│ • Runtime: ${this.getUptime()}
│ • Commands: ${this.bot.commands.size}
│
╰──────────────────❒

Type .menu <category> for details`;

        if (!category) {
            return message.reply(mainMenu);
        }

        // Show category-specific menus
        const menus = {
            group: this.getGroupMenu(),
            games: this.getGamesMenu(),
            download: this.getDownloaderMenu(),
            tools: this.getToolsMenu(),
            fun: this.getFunMenu(),
            info: this.getInfoMenu()
        };

        if (menus[category]) {
            await message.reply(menus[category]);
        } else {
            await message.reply('❌ Invalid menu category!');
        }
    }

    getGroupMenu() {
        return `╭─❒ 『 GROUP COMMANDS 』 ❒
│
├─❒ 👥 *Member Management*
│ • .add
│ • .kick
│ • .promote
│ • .demote
│ • .tagall
│ • .hidetag
│
├─❒ ⚙️ *Group Settings*
│ • .setwelcome <text>
│ • .setgoodbye <text>
│ • .mute
│ • .unmute
│ • .lockgc
│ • .unlockgc
│
├─❒ 🛠️ *Admin Tools*
│ • .updategname
│ • .updategdesc
│ • .revoke
│ • .ginfo
│ • .disappear on/off
│ • .senddm
│
╰──────────────────❒`;
    }

    getGamesMenu() {
        return `╭─❒ 『 GAME COMMANDS 』 ❒
│
├─❒ 🎮 *RPG Games*
│ • .rpg start
│ • .rpg inventory
│ • .rpg shop
│ • .rpg quest
│
├─❒ 🎯 *Mini Games*
│ • .quiz <category>
│ • .word scramble
│ • .word chain
│ • .math <level>
│
├─❒ 🎲 *Fun Games*
│ • .truth
│ • .dare
│ • .slot
│ • .fish
│ • .mine
│
╰──────────────────❒`;
    }

    getDownloaderMenu() {
        return `╭─❒ 『 DOWNLOADER 』 ❒
│
├─❒ 📥 *Social Media*
│ • .fb <url> - Facebook
│ • .insta <url> - Instagram
│ • .tt <url> - TikTok
│ • .twitter <url> - Twitter
│ • .mediafire <url>
│
├─❒ 📺 *Video & Music*
│ • .video <url/query>
│ • .video2 <url>
│ • .play <query>
│ • .play2 <title>
│ • .song <query>
│ • .yta <url>
│
├─❒ 📱 *Apps & Movies*
│ • .apk <name>
│ • .darama <title>
│ • .baiscopelk <url>
│ • .ginisila <title>
│ • .gdrive <url>
│
╰──────────────────❒`;
    }

    getToolsMenu() {
        return `╭─❒ 『 TOOLS & UTILITIES 』 ❒
│
├─❒ 🖼️ *Media Tools*
│ • .sticker
│ • .toimg
│ • .removebg
│ • .enhance
│ • .compress
│
├─❒ 📝 *Text Tools*
│ • .translate <lang> <text>
│ • .tts <text>
│ • .ocr
│ • .encode
│ • .decode
│
├─❒ 🧮 *Calculators*
│ • .calc
│ • .currency
│ • .time
│ • .weather
│
├─❒ 📊 *Other Tools*
│ • .shorten <url>
│ • .qr create/scan
│ • .backup
│ • .restore
│
╰──────────────────❒`;
    }

    getFunMenu() {
        return `╭─❒ 『 FUN & ENTERTAINMENT 』 ❒
│
├─❒ 🎨 *Creative*
│ • .art <style> <prompt>
│ • .meme create
│ • .quote make
│ • .logo <text>
│
├─❒ 🤖 *AI Chat*
│ • .girl <personality>
│ • .roleplay <character>
│ • .story <genre>
│ • .joke <type>
│
├─❒ 🎯 *Games*
│ • .truth
│ • .dare
│ • .slot
│ • .fish
│ • .mine
│
╰──────────────────❒`;
    }

    getInfoMenu() {
        return `╭─❒ 『 INFORMATION 』 ❒
│
├─❒ 🤖 *Bot Info*
│ • .stats
│ • .ping
│ • .runtime
│ • .report bug
│
├─❒ 👥 *User Info*
│ • .profile
│ • .level
│ • .rank
│ • .inventory
│
├─❒ 📊 *System*
│ • .usage
│ • .speed
│ • .backup
│ • .update
│
╰──────────────────❒`;
    }

    getUptime() {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    getSearchMenu() {
        return `╭─❒ 『 SEARCH 』 ❒
│
├─❒ 🔍 *Media Search*
│ • .yts <text> - YouTube search
│ • .yta <url> - YouTube audio
│ • .loli <text> - Anime search
│ • .img <text> - Image search
│
├─❒ 📊 *Information*
│ • .movieinfo <text>
│ • .weather <city>
│ • .define <word>
│ • .fact
│ • .quote
│
├─❒ 🤖 *AI Features*
│ • .gpt <text>
│ • .ai <text>
│ • .bot <text>
│
╰──────────────────❒`;
    }

    getOwnerMenu() {
        return `╭─❒ 『 OWNER COMMANDS 』 ❒
│
├─❒ ⚙️ *System*
│ • .updatecmd
│ • .settings
│ • .system
│ • .status
│ • .restart
│ • .shutdown
│
├─❒ 👥 *User Management*
│ • .block
│ • .unblock
│ • .broadcast
│ • .clearchats
│
├─❒ 🛠️ *Other*
│ • .setpp
│ • .jid
│ • .gjid
│
╰──────────────────❒`;
    }

    getConverterMenu() {
        return `╭─❒ 『 CONVERTER 』 ❒
│
├─❒ 🎨 *Media Convert*
│ • .sticker
│ • .toimg
│ • .removebg
│
├─❒ 🗣️ *Language*
│ • .trt <text>
│ • .tts <text>
│
├─❒ 📝 *Text Tools*
│ • .fancy <text>
│ • .encode
│ • .decode
│
╰──────────────────❒`;
    }

    getRandomMenu() {
        return `╭─❒ 『 RANDOM 』 ❒
│
├─❒ 🎭 *Fun*
│ • .joke
│ • .fact
│ • .quote
│ • .hack
│
├─❒ 🖼️ *Images*
│ • .anime
│ • .animegirl
│ • .dog
│ • .king
│
├─❒ 🎲 *Games*
│ • .truth
│ • .dare
│ • .slot
│ • .fish
│
╰──────────────────❒`;
    }
}

module.exports = MenuCommand; 