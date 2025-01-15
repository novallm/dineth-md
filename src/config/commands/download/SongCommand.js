const Command = require('../../structures/Command');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs').promises;
const path = require('path');

class SongCommand extends Command {
    constructor() {
        super({
            name: 'song',
            aliases: ['music', 'audio'],
            description: 'Download songs',
            category: 'download'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 🎵 SONG DOWNLOADER 』 ❒
│
├─❒ 📥 *Commands*
│ • .song <name/url>
│ • .song playlist <url>
│ • .song search <query>
│
├─❒ 🎧 *Quality Options*
│ • 128kbps (Default)
│ • 320kbps (Premium)
│
├─❒ 📝 *Example*
│ .song Faded - Alan Walker
│
╰──────────────────❒`);
        }

        const query = args.join(' ');
        await message.reply('🎵 *Searching your song...*');

        try {
            // Search for the song
            const results = await yts(query);
            if (!results.videos.length) {
                return message.reply('❌ Song not found!');
            }

            const song = results.videos[0];
            const songInfo = `╭─❒ 『 SONG FOUND 』 ❒
│
├─❒ 📝 *Title:* ${song.title}
├─❒ 👤 *Artist:* ${song.author.name}
├─❒ ⏱️ *Duration:* ${song.duration.timestamp}
├─❒ 👁️ *Views:* ${song.views.toLocaleString()}
│
├─❒ 📥 *Downloading...*
│ Please wait a moment
│
╰──────────────────❒`;

            await message.reply(songInfo);

            // Download the song
            const tempPath = path.join(__dirname, '../../../temp', `${Date.now()}.mp3`);
            const stream = ytdl(song.url, { 
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            const file = await new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(tempPath);
                stream.pipe(fileStream);
                fileStream.on('finish', () => resolve(tempPath));
                fileStream.on('error', reject);
            });

            // Send the audio file
            await message.client.sendMessage(message.key.remoteJid, {
                audio: { url: file },
                mimetype: 'audio/mpeg',
                fileName: `${song.title}.mp3`
            });

            // Clean up temp file
            await fs.unlink(tempPath);

        } catch (error) {
            console.error('Song download error:', error);
            message.reply('❌ Failed to download song. Please try again.');
        }
    }
}

module.exports = SongCommand; 