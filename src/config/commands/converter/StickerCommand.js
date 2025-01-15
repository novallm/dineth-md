const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class StickerCommand extends Command {
    constructor() {
        super({
            name: 'sticker',
            aliases: ['s'],
            description: 'Convert image/video to sticker',
            category: 'converter',
            usage: '!sticker [pack] [author]'
        });
    }

    async execute(message, args) {
        const quotedMessage = message.quoted || message;
        
        if (!quotedMessage.message?.imageMessage && !quotedMessage.message?.videoMessage) {
            return message.reply('Please send an image/video or reply to one!');
        }

        try {
            message.reply('⏳ Creating sticker...');

            const buffer = await downloadMediaMessage(
                quotedMessage,
                'buffer',
                {},
                { logger: console }
            );

            const packname = args[0] || 'Dineth MD V1';
            const author = args[1] || 'Bot';

            // Process image with sharp
            const sticker = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .toBuffer();

            await message.client.sendMessage(message.key.remoteJid, {
                sticker: sticker,
                packname: packname,
                author: author
            });

        } catch (error) {
            console.error('Sticker creation error:', error);
            message.reply('❌ Failed to create sticker. Please try again.');
        }
    }
}

module.exports = StickerCommand; 