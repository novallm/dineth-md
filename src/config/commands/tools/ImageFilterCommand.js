const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageFilterCommand extends Command {
    constructor() {
        super({
            name: 'filter',
            aliases: ['edit', 'fx'],
            description: 'Apply filters to images',
            category: 'tools',
            usage: '.filter <effect> <reply to image>'
        });

        this.filters = {
            blur: (img) => img.blur(5),
            grayscale: (img) => img.grayscale(),
            sepia: (img) => img.sepia(),
            invert: (img) => img.negate(),
            bright: (img) => img.modulate({ brightness: 1.5 }),
            dark: (img) => img.modulate({ brightness: 0.5 }),
            saturate: (img) => img.modulate({ saturation: 2 })
        };
    }

    async execute(message, args) {
        if (!args[0] || !message.quoted) {
            return message.reply(`╭─❒ 『 IMAGE FILTERS 』 ❒
│
├─❒ 🎨 *Available Filters:*
│ • blur
│ • grayscale
│ • sepia
│ • invert
│ • bright
│ • dark
│ • saturate
│
├─❒ 📝 *Usage:*
│ .filter <effect> 
│ (Reply to an image)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const effect = args[0].toLowerCase();
        if (!this.filters[effect]) {
            return message.reply('❌ Invalid filter effect!');
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const outputPath = path.join(__dirname, `../../../temp/${Date.now()}.jpg`);

            await sharp(buffer)
                .pipe(this.filters[effect](sharp()))
                .toFile(outputPath);

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: outputPath },
                caption: `✨ Filter: ${effect}\nPowered by Dineth MD`
            });

            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Image filter error:', error);
            message.reply('❌ Failed to apply filter.');
        }
    }
}

module.exports = ImageFilterCommand; 