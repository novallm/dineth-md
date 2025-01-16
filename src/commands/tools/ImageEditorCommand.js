const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageEditorCommand extends Command {
    constructor() {
        super({
            name: 'edit',
            aliases: ['imgedit', 'editimg'],
            description: 'Advanced image editor',
            category: 'tools',
            usage: '.edit <effect> <reply to image>'
        });

        this.effects = {
            blur: (img) => img.blur(5),
            sharpen: (img) => img.sharpen(),
            greyscale: (img) => img.greyscale(),
            sepia: (img) => img.sepia(),
            invert: (img) => img.negate(),
            brightness: (img) => img.modulate({ brightness: 1.5 }),
            saturation: (img) => img.modulate({ saturation: 2 }),
            hue: (img) => img.modulate({ hue: 180 }),
            flip: (img) => img.flip(),
            flop: (img) => img.flop(),
            rotate: (img) => img.rotate(90)
        };
    }

    async execute(message, args) {
        if (!args[0] || !message.quoted) {
            return message.reply(`╭─❒ 『 IMAGE EDITOR 』 ❒
│
├─❒ 🎨 *Available Effects:*
│ • blur
│ • sharpen
│ • greyscale
│ • sepia
│ • invert
│ • brightness
│ • saturation
│ • hue
│ • flip
│ • flop
│ • rotate
│
├─❒ 📝 *Usage:*
│ .edit <effect>
│ (Reply to an image)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const effect = args[0].toLowerCase();
        if (!this.effects[effect]) {
            return message.reply('❌ Invalid effect!');
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const outputPath = path.join(__dirname, `../../../temp/${Date.now()}.jpg`);

            await sharp(buffer)
                .pipe(this.effects[effect](sharp()))
                .toFile(outputPath);

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: outputPath },
                caption: `✨ Effect: ${effect}\nEdited by Dineth MD`
            });

            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Image editing error:', error);
            message.reply('❌ Failed to edit image.');
        }
    }
}

module.exports = ImageEditorCommand; 