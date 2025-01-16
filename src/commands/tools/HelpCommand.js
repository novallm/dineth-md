const { MessageType } = require('@whiskeysockets/baileys');

class HelpCommand {
    constructor() {
        this.name = 'help';
        this.description = 'Bot help and troubleshooting';
    }

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(`*🔰 DinethMD Bot Help*\n\n` +
                `*Quick Start*\n` +
                `*.help setup* - Setup guide\n` +
                `*.help error* - Error fixes\n` +
                `*.help commands* - Command list\n` +
                `*.help faq* - FAQ\n` +
                `*.help update* - Update bot\n\n` +
                
                `*Free Features*\n` +
                `• All basic commands\n` +
                `• Group management\n` +
                `• Media downloads\n` +
                `• Sticker creation\n` +
                `• Fun & games\n\n` +
                
                `*Limitations*\n` +
                `• 50 AI requests/day\n` +
                `• 100 media downloads/day\n` +
                `• Basic image editing\n` +
                `• Standard quality\n` +
                `• Community support\n\n` +
                
                `*Need Help?*\n` +
                `Join support group:\n` +
                `https://chat.whatsapp.com/support\n\n` +
                
                `Type command for details!`);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'setup':
                return message.reply(`*⚙️ Setup Guide*\n\n` +
                    `*1. Prerequisites*\n` +
                    `• Node.js 16+ installed\n` +
                    `• Git installed\n` +
                    `• Basic terminal knowledge\n\n` +
                    
                    `*2. Installation*\n` +
                    `• Clone repository\n` +
                    `*.help git* for commands\n\n` +
                    
                    `*3. Configuration*\n` +
                    `• Copy .env.example to .env\n` +
                    `• Get free API keys:\n` +
                    `  - OpenAI (Optional)\n` +
                    `  - RapidAPI (Optional)\n` +
                    `  - Cloudinary (Optional)\n` +
                    `  - OpenWeather (Optional)\n\n` +
                    
                    `*4. Start Bot*\n` +
                    `• Run: npm install\n` +
                    `• Run: npm start\n` +
                    `• Scan QR code\n\n` +
                    
                    `*5. Test Bot*\n` +
                    `• Send: .menu\n` +
                    `• Try basic commands\n` +
                    `• Check connectivity\n\n` +
                    
                    `For detailed guide:\n` +
                    `*.help docs*`);

            case 'error':
                return message.reply(`*🔧 Error Solutions*\n\n` +
                    `*Connection Issues*\n` +
                    `• Bot not responding\n` +
                    `*.help conn* - Connection fixes\n\n` +
                    
                    `*API Errors*\n` +
                    `• API limit reached\n` +
                    `• Invalid API key\n` +
                    `*.help api* - API solutions\n\n` +
                    
                    `*Media Errors*\n` +
                    `• Download failed\n` +
                    `• Conversion failed\n` +
                    `*.help media* - Media fixes\n\n` +
                    
                    `*Common Errors*\n` +
                    `• QR code issues\n` +
                    `• Installation errors\n` +
                    `• Command not working\n` +
                    `*.help common* - Common fixes\n\n` +
                    
                    `*System Errors*\n` +
                    `• Memory issues\n` +
                    `• CPU usage high\n` +
                    `• Crash reports\n` +
                    `*.help system* - System fixes`);

            case 'commands':
                return message.reply(`*📝 Command Guide*\n\n` +
                    `*Basic Commands*\n` +
                    `• *.menu* - Main menu\n` +
                    `• *.info* - Bot info\n` +
                    `• *.ping* - Test bot\n` +
                    `• *.status* - Bot status\n\n` +
                    
                    `*Group Commands*\n` +
                    `• *.group* - Group menu\n` +
                    `• *.admin* - Admin menu\n` +
                    `• *.settings* - Settings\n\n` +
                    
                    `*Media Commands*\n` +
                    `• *.media* - Media menu\n` +
                    `• *.download* - Download\n` +
                    `• *.convert* - Convert\n\n` +
                    
                    `*Tool Commands*\n` +
                    `• *.tools* - Tools menu\n` +
                    `• *.sticker* - Make sticker\n` +
                    `• *.search* - Web search\n\n` +
                    
                    `*Game Commands*\n` +
                    `• *.games* - Games menu\n` +
                    `• *.play* - Play games\n` +
                    `• *.quiz* - Start quiz`);

            case 'faq':
                return message.reply(`*❓ FAQ*\n\n` +
                    `*General Questions*\n` +
                    `Q: Is this bot free?\n` +
                    `A: Yes, completely free!\n\n` +
                    
                    `Q: API keys required?\n` +
                    `A: Optional for extra features\n\n` +
                    
                    `Q: Daily limits?\n` +
                    `A: Yes, to prevent abuse\n\n` +
                    
                    `Q: Multiple groups?\n` +
                    `A: Yes, can join many groups\n\n` +
                    
                    `Q: Support available?\n` +
                    `A: Yes, via support group\n\n` +
                    
                    `Q: Can be modified?\n` +
                    `A: Yes, open source!\n\n` +
                    
                    `Q: Updates available?\n` +
                    `A: Yes, regular updates\n\n` +
                    
                    `More questions?\n` +
                    `Join support group!`);

            case 'update':
                return message.reply(`*🔄 Update Guide*\n\n` +
                    `*1. Backup Data*\n` +
                    `• Save your .env file\n` +
                    `• Backup session file\n` +
                    `• Backup custom files\n\n` +
                    
                    `*2. Update Code*\n` +
                    `• Stop bot\n` +
                    `• Pull new changes\n` +
                    `• Update dependencies\n\n` +
                    
                    `*3. Restore Data*\n` +
                    `• Restore .env\n` +
                    `• Restore session\n` +
                    `• Check configs\n\n` +
                    
                    `*4. Test Update*\n` +
                    `• Start bot\n` +
                    `• Check version\n` +
                    `• Test features\n\n` +
                    
                    `*Update Commands*\n` +
                    `*.update check* - Check version\n` +
                    `*.update start* - Start update\n` +
                    `*.update revert* - Revert update`);

            default:
                return message.reply('❌ Invalid help option. Use *.help* to see all options.');
        }
    }
}

module.exports = HelpCommand; 