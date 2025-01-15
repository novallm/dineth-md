const Command = require('../../structures/Command');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class PlayCommand extends Command {
    constructor() {
        super({
            name: 'play',
            aliases: ['p', 'song'],
            description: 'Play YouTube audio/video',
            category: 'media',
            usage: '.play <song name/url>'
        });
    }

    async execute(message, args) {
        if (!args.length) return message.reply('❌ Please provide a song name or URL!');

        const query = args.join(' ');
        const searchMessage = await message.reply('🔍 *Searching...*');

        try {
            // Search for video
            const video = await this.searchVideo(query);
            if (!video) return searchMessage.edit('❌ No results found!');

            // Get video info
            const info = await ytdl.getInfo(video.url);
            const songInfo = `╭─❒ 『 MUSIC PLAYER 』 ❒
│
├─❒ 🎵 *Title:* ${video.title}
├─❒ 👤 *Channel:* ${video.author.name}
├─❒ ⏱️ *Duration:* ${video.duration.timestamp}
├─❒ 👁️ *Views:* ${video.views.toLocaleString()}
│
├─❒ 📊 *Quality Options*
│ • 🎵 Music (128kbps)
│ • 🎧 HD Audio (320kbps)
│ • 📹 Video (720p)
│
╰──────────────────❒

⏳ *Downloading...*`;

            await searchMessage.edit(songInfo);

            // Download and process
            const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            const tempDir = path.join(__dirname, '../../../temp');
            await fs.mkdir(tempDir, { recursive: true });

            const audioPath = path.join(tempDir, `${video.videoId}.mp3`);
            const writeStream = fs.createWriteStream(audioPath);

            ytdl(video.url, { format: audioFormat })
                .pipe(writeStream)
                .on('finish', async () => {
                    // Send as audio with metadata
                    await message.client.sendMessage(message.key.remoteJid, {
                        audio: { url: audioPath },
                        mimetype: 'audio/mp4',
                        fileName: `${video.title}.mp3`,
                        contextInfo: {
                            externalAdReply: {
                                title: video.title,
                                body: video.author.name,
                                mediaType: 2,
                                thumbnail: await this.getBuffer(video.thumbnail),
                                mediaUrl: video.url
                            }
                        }
                    });

                    // Auto-fetch lyrics
                    if (process.env.AUTO_LYRICS === 'true') {
                        const lyrics = await this.getLyrics(video.title);
                        if (lyrics) {
                            await message.reply(`📝 *Lyrics*\n\n${lyrics}`);
                        }
                    }

                    // Clean up
                    await fs.unlink(audioPath);
                });

            // Add to queue if music is already playing
            // Implement queue system here

            // Auto-react
            if (process.env.AUTO_REACT === 'true') {
                const reactions = ['🎵', '🎶', '🎧', '🎼', '🎹'];
                const reaction = reactions[Math.floor(Math.random() * reactions.length)];
                await message.react(reaction);
            }

        } catch (error) {
            console.error('Play command error:', error);
            searchMessage.edit('❌ Failed to play audio. Please try again.');
        }
    }

    async searchVideo(query) {
        const results = await yts(query);
        return results.videos.length > 0 ? results.videos[0] : null;
    }

    async getLyrics(title) {
        try {
            const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(title)}`);
            return response.data.lyrics;
        } catch {
            return null;
        }
    }

    async getBuffer(url) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    }
}

module.exports = PlayCommand; 