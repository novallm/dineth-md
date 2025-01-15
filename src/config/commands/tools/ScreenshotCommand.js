const Command = require('../../structures/Command');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class ScreenshotCommand extends Command {
    constructor() {
        super({
            name: 'ss',
            aliases: ['screenshot', 'web'],
            description: 'Take website screenshots',
            category: 'tools',
            usage: '.ss <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 WEBSITE SCREENSHOT 』 ❒
│
├─❒ 📸 *Usage:*
│ .ss <url>
│
├─❒ 📝 *Example:*
│ .ss google.com
│
├─❒ 🔍 *Features:*
│ • Full page capture
│ • Mobile/Desktop view
│ • High quality
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const url = args[0].startsWith('http') ? args[0] : `https://${args[0]}`;
        await message.reply('📸 *Taking screenshot...*');

        try {
            const response = await axios.get(`https://api.screenshotmachine.com`, {
                params: {
                    key: process.env.SCREENSHOT_API_KEY,
                    url: url,
                    dimension: '1920x1080',
                    format: 'jpg',
                    delay: 2000
                },
                responseType: 'arraybuffer'
            });

            await message.client.sendMessage(message.key.remoteJid, {
                image: Buffer.from(response.data),
                caption: `🌐 *Website:* ${url}\n✨ Captured by Dineth MD`
            });

        } catch (error) {
            console.error('Screenshot error:', error);
            message.reply('❌ Failed to capture screenshot. Please check the URL.');
        }
    }
}

module.exports = ScreenshotCommand; 