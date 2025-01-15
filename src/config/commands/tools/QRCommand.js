const Command = require('../../structures/Command');
const qrcode = require('qrcode');
const { tmpdir } = require('os');
const { join } = require('path');
const { writeFile } = require('fs').promises;

class QRCommand extends Command {
    constructor() {
        super({
            name: 'qr',
            description: 'Generate or read QR codes',
            category: 'tools',
            usage: '!qr <text/url>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide text or URL to convert to QR code!');
        }

        const text = args.join(' ');
        const qrPath = join(tmpdir(), `qr-${Date.now()}.png`);

        try {
            // Generate QR code
            await qrcode.toFile(qrPath, text, {
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                },
                width: 1000,
                margin: 1
            });

            // Send QR code
            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: qrPath },
                caption: '✅ QR Code generated successfully!'
            });

            // Clean up
            await writeFile(qrPath, '');
        } catch (error) {
            console.error('QR generation error:', error);
            message.reply('❌ Failed to generate QR code.');
        }
    }
}

module.exports = QRCommand; 