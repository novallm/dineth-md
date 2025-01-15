const Command = require('../../structures/Command');
const os = require('os');

class Menu2Command extends Command {
    constructor() {
        super({
            name: 'menu2',
            aliases: ['help2', 'list2'],
            description: 'Display advanced features menu',
            category: 'info'
        });
    }

    async execute(message) {
        const menuText = `╭────❒ 『 DINETH MD ADVANCED 』 ❒────
│ *Bot Name:* Dineth MD V1
│ *Creator:* Dineth Nethsara
│ *Version:* 1.0.0
╰────────────────────❒

🎮 *GAME COMMANDS*
┋ .truth - Truth questions
┋ .dare - Dare challenges
┋ .slot - Slot machine game
┋ .tictactoe - Play TicTacToe
┋ .chess - Play chess
┋ .quiz - Knowledge quiz
┋ .riddle - Solve riddles
┋ .math - Math challenges
┕───────────────────❒

🎨 *CREATOR COMMANDS*
┋ .logo - Create text logos
┋ .quote - Create quote images
┋ .meme - Create memes
┋ .edit - Edit images
┋ .blur - Blur images
┋ .pixel - Pixelate images
┕───────────────────❒

🔧 *TOOL COMMANDS*
┋ .tts - Text to speech
┋ .ocr - Extract text from image
┋ .qr - Generate QR code
┋ .scan - Scan QR code
┋ .short - URL shortener
┋ .calc - Calculator
┕───────────────────❒

📊 *ADMIN COMMANDS*
┋ .warn - Warn users
┋ .kick - Remove members
┋ .add - Add members
┋ .promote - Make admin
┋ .demote - Remove admin
┋ .mute - Mute group
┋ .unmute - Unmute group
┕───────────────────❒

🎵 *MEDIA COMMANDS*
┋ .play - Play music
┋ .video - Play video
┋ .lyrics - Find lyrics
┋ .playlist - Create playlist
┋ .radio - Play radio
┕───────────────────❒

Type .menu for main commands
Type .owner for support`;

        await message.client.sendMessage(message.key.remoteJid, {
            image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/menu.jpg' },
            caption: menuText,
            footer: '© Dineth MD Bot 2024'
        });
    }
}

module.exports = Menu2Command; 