const Command = require('../../structures/Command');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const path = require('path');
const fs = require('fs').promises;
const { createCanvas } = require('canvas');

class MusicVisualizerCommand extends Command {
    constructor() {
        super({
            name: 'visualize',
            aliases: ['musicviz', 'mv'],
            description: 'Create a music visualizer from audio',
            category: 'tools',
            usage: '.visualize <reply to audio>'
        });
    }

    async execute(message) {
        if (!message.quoted) {
            return message.reply(`╭─❒ 『 MUSIC VISUALIZER 』 ❒
│
├─❒ 🎶 *Usage:*
│ .visualize
│ (Reply to an audio file)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            await message.reply('🎨 *Creating music visualizer...*');

            // Create a canvas for the visualizer
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // Simulate a simple visualizer (this would be replaced with actual audio analysis)
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(0, 200, 800, Math.random() * 200);

            const outputPath = path.join(__dirname, `../../../temp/visualizer_${Date.now()}.png`);
            const bufferImage = canvas.toBuffer('image/png');
            await fs.writeFile(outputPath, bufferImage);

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: outputPath },
                caption: '✨ Music Visualizer by Dineth MD'
            });

            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Music visualizer error:', error);
            message.reply('❌ Failed to create music visualizer.');
        }
    }
}

module.exports = MusicVisualizerCommand; 