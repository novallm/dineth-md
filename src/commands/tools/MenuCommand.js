const { MessageType } = require('@whiskeysockets/baileys');

class MenuCommand {
    constructor() {
        this.name = 'menu';
        this.description = 'DinethMD Bot Menu System';
    }

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(`*🌟 DinethMD Bot Menu*\n\n` +
                `*Main Commands*\n` +
                `*.menu ai* - AI & Assistant\n` +
                `*.menu media* - Media & Downloads\n` +
                `*.menu group* - Group Features\n` +
                `*.menu tools* - Utility Tools\n` +
                `*.menu games* - Fun & Games\n\n` +
                
                `*Core Features*\n` +
                `*.core ai* - OpenAI Features\n` +
                `*.core media* - Media Tools\n` +
                `*.core image* - Image Processing\n` +
                `*.core weather* - Weather Info\n` +
                `*.core crypto* - Crypto Data\n\n` +
                
                `*Super Features*\n` +
                `*.super voice* - Voice Tools\n` +
                `*.super social* - Social Media\n` +
                `*.super shop* - E-commerce\n` +
                `*.super art* - AI Art\n` +
                `*.super learn* - Education\n\n` +
                
                `*Ultra Features*\n` +
                `*.ultra security* - Security\n` +
                `*.ultra cloud* - Cloud Storage\n` +
                `*.ultra stream* - Streaming\n` +
                `*.ultra health* - Health\n` +
                `*.ultra travel* - Travel\n\n` +
                
                `*Premium Features*\n` +
                `*.premium* - View Premium\n` +
                `*.owner* - Contact Owner\n` +
                `*.donate* - Support Bot\n\n` +
                
                `*Bot Info*\n` +
                `Creator: DinethMD\n` +
                `Version: 2.0.0\n` +
                `Prefix: .\n` +
                `Status: Online ✅\n\n` +
                
                `Type any command for details!`);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'ai':
                return message.reply(`*🤖 AI & Assistant*\n\n` +
                    `*Chat & Writing*\n` +
                    `• *.ai chat* - Chat with AI\n` +
                    `• *.ai write* - Writing help\n` +
                    `• *.ai code* - Code generation\n` +
                    `• *.ai math* - Math solutions\n` +
                    `• *.ai translate* - Translation\n\n` +
                    
                    `*Creation & Analysis*\n` +
                    `• *.ai create* - Content creation\n` +
                    `• *.ai analyze* - Text analysis\n` +
                    `• *.ai research* - Research help\n` +
                    `• *.ai learn* - Learning aid\n` +
                    `• *.ai brainstorm* - Ideas\n\n` +
                    
                    `*Advanced Features*\n` +
                    `• *.ai voice* - Voice chat\n` +
                    `• *.ai image* - Image analysis\n` +
                    `• *.ai data* - Data analysis\n` +
                    `• *.ai assist* - Personal assistant\n` +
                    `• *.ai custom* - Custom AI`);

            case 'media':
                return message.reply(`*📱 Media & Downloads*\n\n` +
                    `*Music & Audio*\n` +
                    `• *.media song* - Download song\n` +
                    `• *.media lyrics* - Find lyrics\n` +
                    `• *.media playlist* - Create playlist\n` +
                    `• *.media audio* - Audio tools\n` +
                    `• *.media podcast* - Podcasts\n\n` +
                    
                    `*Video & Streaming*\n` +
                    `• *.media video* - Download video\n` +
                    `• *.media movie* - Movie info\n` +
                    `• *.media stream* - Live stream\n` +
                    `• *.media tube* - YouTube tools\n` +
                    `• *.media live* - Live TV\n\n` +
                    
                    `*Social Media*\n` +
                    `• *.media insta* - Instagram\n` +
                    `• *.media tiktok* - TikTok\n` +
                    `• *.media fb* - Facebook\n` +
                    `• *.media twitter* - Twitter\n` +
                    `• *.media pin* - Pinterest`);

            case 'group':
                return message.reply(`*👥 Group Features*\n\n` +
                    `*Management*\n` +
                    `• *.group add* - Add member\n` +
                    `• *.group kick* - Remove member\n` +
                    `• *.group promote* - Promote admin\n` +
                    `• *.group demote* - Demote admin\n` +
                    `• *.group info* - Group info\n\n` +
                    
                    `*Settings*\n` +
                    `• *.group link* - Group link\n` +
                    `• *.group settings* - Group settings\n` +
                    `• *.group rules* - Set rules\n` +
                    `• *.group welcome* - Welcome msg\n` +
                    `• *.group goodbye* - Goodbye msg\n\n` +
                    
                    `*Activities*\n` +
                    `• *.group game* - Group games\n` +
                    `• *.group poll* - Create poll\n` +
                    `• *.group event* - Plan event\n` +
                    `• *.group stats* - Group stats\n` +
                    `• *.group activity* - View activity`);

            case 'tools':
                return message.reply(`*🛠️ Utility Tools*\n\n` +
                    `*Converters*\n` +
                    `• *.tools sticker* - Create sticker\n` +
                    `• *.tools mp3* - Convert to MP3\n` +
                    `• *.tools mp4* - Convert to MP4\n` +
                    `• *.tools img* - Convert image\n` +
                    `• *.tools doc* - Convert document\n\n` +
                    
                    `*Utilities*\n` +
                    `• *.tools calc* - Calculator\n` +
                    `• *.tools trans* - Translator\n` +
                    `• *.tools search* - Web search\n` +
                    `• *.tools qr* - QR code\n` +
                    `• *.tools short* - URL shortener\n\n` +
                    
                    `*Information*\n` +
                    `• *.tools weather* - Weather info\n` +
                    `• *.tools news* - Latest news\n` +
                    `• *.tools wiki* - Wikipedia\n` +
                    `• *.tools dict* - Dictionary\n` +
                    `• *.tools covid* - Covid info`);

            case 'games':
                return message.reply(`*🎮 Fun & Games*\n\n` +
                    `*Mini Games*\n` +
                    `• *.games quiz* - Quiz game\n` +
                    `• *.games truth* - Truth/Dare\n` +
                    `• *.games word* - Word game\n` +
                    `• *.games math* - Math game\n` +
                    `• *.games trivia* - Trivia\n\n` +
                    
                    `*Multiplayer*\n` +
                    `• *.games chess* - Play chess\n` +
                    `• *.games ttt* - Tic tac toe\n` +
                    `• *.games battle* - Battle game\n` +
                    `• *.games cards* - Card games\n` +
                    `• *.games multi* - Group games\n\n` +
                    
                    `*Fun Tools*\n` +
                    `• *.games meme* - Random meme\n` +
                    `• *.games joke* - Random joke\n` +
                    `• *.games quote* - Random quote\n` +
                    `• *.games fact* - Random fact\n` +
                    `• *.games fortune* - Fortune cookie`);

            default:
                return message.reply('❌ Invalid menu option. Use *.menu* to see all options.');
        }
    }
}

module.exports = MenuCommand; 