const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class VideoEditorCommand extends Command {
    constructor() {
        super({
            name: 'vedit',
            aliases: ['videoedit', 'editvid'],
            description: 'Edit videos with various effects',
            category: 'tools',
            usage: '.vedit <effect>'
        });

        this.effects = {
            slow: (cmd) => cmd.fps(15),
            fast: (cmd) => cmd.fps(60),
            reverse: (cmd) => cmd.videoFilters('reverse'),
            fade: (cmd) => cmd.videoFilters('fade=in:0:30,fade=out:st=4:d=30'),
            blur: (cmd) => cmd.videoFilters('boxblur=5:1'),
            vintage: (cmd) => cmd.videoFilters('colorbalance=rs=.3:gs=.3:bs=.3:rm=.3:gm=.3:bm=.3:rh=.3:gh=.3:bh=.3'),
            mirror: (cmd) => cmd.videoFilters('hflip')
        };
    }

    async execute(message, args) {
        if (!args[0] || !message.quoted) {
            return message.reply(`╭─❒ 『 VIDEO EDITOR 』 ❒
│
├─❒ 🎬 *Effects:*
│ • slow - Slow motion
│ • fast - Speed up
│ • reverse - Reverse video
│ • fade - Add fade effect
│ • blur - Blur effect
│ • vintage - Vintage look
│ • mirror - Mirror effect
│
├─❒ 📝 *Usage:*
│ .vedit <effect>
│ (Reply to a video)
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
            const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.mp4`);
            const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.mp4`);

            await fs.writeFile(inputPath, buffer);
            await message.reply('🎬 *Applying video effect...*');

            await new Promise((resolve, reject) => {
                let command = ffmpeg(inputPath);
                command = this.effects[effect](command);
                command
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            await message.client.sendMessage(message.key.remoteJid, {
                video: { url: outputPath },
                caption: `✨ Effect: ${effect}\nEdited by Dineth MD`
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Video editing error:', error);
            message.reply('❌ Failed to edit video.');
        }
    }
}

module.exports = VideoEditorCommand; 