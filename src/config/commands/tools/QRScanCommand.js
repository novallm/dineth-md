const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const Jimp = require('jimp');
const qrcode = require('qrcode-reader');
const fs = require('fs').promises;
const path = require('path');

class QRScanCommand extends Command {
    constructor() {
        super({
            name: 'scan',
            description: 'Scan QR codes from images',
            category: 'tools',
            usage: '.scan <reply to image>'
        });
    }

    async execute(message) {
        const quoted = message.quoted;
        if (!quoted || !quoted.message?.imageMessage) {
            return message.reply('Please reply to an image containing a QR code!');
        }

        await message.reply('🔍 *Scanning QR code...*');

        try {
            const buffer = await downloadMediaMessage(quoted, 'buffer');
            const image = await Jimp.read(buffer);
            const qr = new qrcode();

            const value = await new Promise((resolve, reject) => {
                qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
                qr.decode(image.bitmap);
            });

            await message.reply(`✅ *QR Code Content:*\n\n${value.result}`);

        } catch (error) {
            console.error('QR scanning error:', error);
            message.reply('❌ Failed to scan QR code. Make sure the image is clear.');
        }
    }
}

module.exports = QRScanCommand; 