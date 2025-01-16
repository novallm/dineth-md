const { MessageType } = require('@whiskeysockets/baileys');

class CoreCommand {
    constructor() {
        this.name = 'core';
        this.description = 'Core features powered by free APIs';
    }

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(`*🚀 Core Commands*\n\n` +
                `1. *OpenAI API* (Free Tier)\n` +
                `*.core ai* - AI & Chat Assistant\n` +
                `• Chat, Writing, Code Help\n` +
                `• Text Analysis, Translation\n` +
                `• Learning Assistant\n\n` +
                
                `2. *RapidAPI* (Free Tier)\n` +
                `*.core media* - Media Tools\n` +
                `• Music Search & Lyrics\n` +
                `• Video Information\n` +
                `• News & Articles\n\n` +
                
                `3. *Cloudinary* (Free Tier)\n` +
                `*.core image* - Image Processing\n` +
                `• Image Editing\n` +
                `• File Conversion\n` +
                `• Media Storage\n\n` +
                
                `4. *OpenWeatherMap* (Free API)\n` +
                `*.core weather* - Weather Info\n` +
                `• Current Weather\n` +
                `• Forecasts\n` +
                `• Location Based\n\n` +
                
                `5. *CoinGecko* (Free API)\n` +
                `*.core crypto* - Crypto Data\n` +
                `• Price Tracking\n` +
                `• Market Info\n` +
                `• Coin Details\n\n` +
                
                `Type any command for options!`);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'ai':
                return message.reply(`*🤖 AI Assistant (OpenAI)*\n\n` +
                    `Features:\n` +
                    `• Smart Chat\n` +
                    `• Writing Help\n` +
                    `• Code Generation\n` +
                    `• Translation\n` +
                    `• Learning Aid\n\n` +
                    `Commands:\n` +
                    `*.core ai chat* - Chat with AI\n` +
                    `*.core ai write* - Writing help\n` +
                    `*.core ai code* - Code help\n` +
                    `*.core ai translate* - Translate\n` +
                    `*.core ai learn* - Study help`);

            case 'media':
                return message.reply(`*📱 Media Tools (RapidAPI)*\n\n` +
                    `Features:\n` +
                    `• Music Search\n` +
                    `• Lyrics Finder\n` +
                    `• Video Info\n` +
                    `• News Search\n` +
                    `• Article Reader\n\n` +
                    `Commands:\n` +
                    `*.core media music* - Find music\n` +
                    `*.core media lyrics* - Get lyrics\n` +
                    `*.core media video* - Video info\n` +
                    `*.core media news* - Latest news\n` +
                    `*.core media article* - Read articles`);

            case 'image':
                return message.reply(`*🖼️ Image Tools (Cloudinary)*\n\n` +
                    `Features:\n` +
                    `• Image Editing\n` +
                    `• Format Conversion\n` +
                    `• File Storage\n` +
                    `• Image Effects\n` +
                    `• Optimization\n\n` +
                    `Commands:\n` +
                    `*.core image edit* - Edit image\n` +
                    `*.core image convert* - Convert format\n` +
                    `*.core image store* - Store file\n` +
                    `*.core image effect* - Add effects\n` +
                    `*.core image optimize* - Optimize image`);

            case 'weather':
                return message.reply(`*🌤️ Weather (OpenWeatherMap)*\n\n` +
                    `Features:\n` +
                    `• Current Weather\n` +
                    `• 5-Day Forecast\n` +
                    `• Location Search\n` +
                    `• Weather Maps\n` +
                    `• Alerts\n\n` +
                    `Commands:\n` +
                    `*.core weather now* - Current weather\n` +
                    `*.core weather forecast* - Get forecast\n` +
                    `*.core weather search* - Find location\n` +
                    `*.core weather map* - Weather map\n` +
                    `*.core weather alert* - Get alerts`);

            case 'crypto':
                return message.reply(`*💰 Crypto (CoinGecko)*\n\n` +
                    `Features:\n` +
                    `• Price Tracking\n` +
                    `• Market Data\n` +
                    `• Coin Info\n` +
                    `• Price Charts\n` +
                    `• Trending Coins\n\n` +
                    `Commands:\n` +
                    `*.core crypto price* - Check prices\n` +
                    `*.core crypto market* - Market data\n` +
                    `*.core crypto info* - Coin details\n` +
                    `*.core crypto chart* - View charts\n` +
                    `*.core crypto trend* - Trending coins`);

            default:
                return message.reply('❌ Invalid command. Use *.core* to see all commands.');
        }
    }
}

module.exports = CoreCommand; 