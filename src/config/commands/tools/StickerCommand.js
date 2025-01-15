const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

class StickerCommand extends Command {
    constructor() {
        super({
            name: 'sticker',
            aliases: ['s', 'stiker'],
            description: 'Create sticker from image/video',
            category: 'tools',
            usage: '.sticker [pack] [author]'
        });
    }

    async execute(message, args) {
        const packname = args[0] || 'Dineth MD';
        const author = args[1] || 'Bot';

        try {
            const quoted = message.quoted || message;
            if (!quoted.message) return message.reply('Reply to an image/video!');

            const mime = Object.keys(quoted.message)[0];
            if (!/image|video/.test(mime)) return message.reply('Send/reply to an image/video!');

            await message.reply('⌛ Creating sticker...');
            
            const media = await downloadMediaMessage(quoted, 'buffer');
            const tmpDir = path.join(__dirname, '../../../temp');
            await fs.mkdir(tmpDir, { recursive: true });

            if (mime.includes('video')) {
                const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
                const outputPath = path.join(tmpDir, `output_${Date.now()}.webp`);
                
                await fs.writeFile(inputPath, media);
                
                await new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .setStartTime('00:00:00')
                        .setDuration('00:00:10')
                        .size('256x256')
                        .save(outputPath)
                        .on('end', resolve)
                        .on('error', reject);
                });

                const stickerBuffer = await fs.readFile(outputPath);
                await message.client.sendMessage(message.key.remoteJid, {
                    sticker: stickerBuffer,
                    packname,
                    author
                });

                await fs.unlink(inputPath);
                await fs.unlink(outputPath);
            } else {
                const sticker = await sharp(media)
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp()
                    .toBuffer();

                await message.client.sendMessage(message.key.remoteJid, {
                    sticker,
                    packname,
                    author
                });
            }
        } catch (error) {
            console.error('Sticker creation error:', error);
            message.reply('❌ Failed to create sticker!');
        }
    }
}

module.exports = StickerCommand; 