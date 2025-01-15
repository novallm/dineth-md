const Command = require('../../structures/Command');
const axios = require('axios');
const ytdl = require('ytdl-core');

class SongCommand extends Command {
    constructor() {
        super({
            name: 'song',
            aliases: ['play', 'music'],
            description: 'Download and play songs',
            category: 'media',
            usage: '.song <name/url>'
        });
    }

    async execute(message, args) {
        if (!args.length) return message.reply('❌ Please provide a song name!');

        const query = args.join(' ');
        const searchMessage = await message.reply('🔍 *Searching for your song...*');

        try {
            // Search on YouTube
            const searchUrl = `https://youtube-music-api-402b.onrender.com/search?q=${encodeURIComponent(query)}`;
            const searchResponse = await axios.get(searchUrl);
            const videos = searchResponse.data.content;

            if (videos.length > 0) {
                const video = videos[0];
                
                const songInfo = `╭─❒ 『 SONG DOWNLOADER 』 ❒
│
├─❒ 🎵 *Title:* ${video.title}
├─❒ 👤 *Artist:* ${video.artist}
├─❒ ⏱️ *Duration:* ${video.duration}
├─❒ 👁️ *Views:* ${video.views}
│
├─❒ 📊 *Quality Options*
│ • 128kbps (Audio)
│ • 320kbps (HD Audio)
│ • MP4 (Video + Audio)
│
╰──────────────────❒

⏳ *Downloading your song...*`;

                await searchMessage.edit(songInfo);

                // Get audio stream
                const audioUrl = await this.getAudioUrl(video.videoId);
                
                // Send as voice note with thumbnail
                await message.client.sendMessage(message.key.remoteJid, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mp4',
                    fileName: `${video.title}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: video.title,
                            body: video.artist,
                            mediaType: 2,
                            thumbnail: await this.getBuffer(video.thumbnail),
                            mediaUrl: `https://youtube.com/watch?v=${video.videoId}`
                        }
                    }
                });

                // Send lyrics if available
                const lyrics = await this.getLyrics(video.title, video.artist);
                if (lyrics) {
                    await message.reply(`📝 *Lyrics*\n\n${lyrics}`);
                }
            } else {
                await searchMessage.edit('❌ Song not found! Try another query.');
            }
        } catch (error) {
            console.error('Song download error:', error);
            await searchMessage.edit('❌ Failed to download song. Please try again.');
        }
    }

    async getAudioUrl(videoId) {
        const info = await ytdl.getInfo(videoId);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        return format.url;
    }

    async getLyrics(title, artist) {
        try {
            const response = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
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

module.exports = SongCommand; 