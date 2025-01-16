const Command = require('../../structures/Command');
const ytSearch = require('yt-search');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs').promises;
const path = require('path');

class YTMusicCommand extends Command {
    constructor() {
        super({
            name: 'music',
            aliases: ['song', 'ytmp3'],
            description: 'Download music from YouTube',
            category: 'download',
            usage: '.music <song name>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 YT MUSIC 』 ❒
│
├─❒ 🎵 *Usage:*
│ .music <song name>
│
├─❒ 📝 *Example:*
│ .music shape of you
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const query = args.join(' ');
        await message.reply('🔍 *Searching...*');

        try {
            // Search for video
            const results = await ytSearch(query);
            const video = results.videos[0];

            if (!video) {
                return message.reply('❌ No results found!');
            }

            await message.reply(`🎵 *Found:* ${video.title}\n⏳ *Downloading...*`);

            // Download audio
            const outputPath = path.join(__dirname, `../../../temp/${Date.now()}.mp3`);
            await youtubedl(video.url, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: outputPath
            });

            // Send audio
            await message.client.sendMessage(message.key.remoteJid, {
                audio: { url: outputPath },
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            });

            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Music download error:', error);
            message.reply('❌ Failed to download music.');
        }
    }
}

module.exports = YTMusicCommand; 