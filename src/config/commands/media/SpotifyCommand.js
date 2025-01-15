const Command = require('../../structures/Command');
const axios = require('axios');

class SpotifyCommand extends Command {
    constructor() {
        super({
            name: 'spotify',
            aliases: ['sp', 'music'],
            description: 'Download from Spotify',
            category: 'media',
            usage: '.spotify <query/url>'
        });
    }

    async execute(message, args) {
        if (!args.length) return message.reply('❌ Please provide a song name or Spotify URL!');

        const query = args.join(' ');
        await message.reply('🎵 *Searching on Spotify...*');

        try {
            // Using free Spotify API
            const response = await axios.get(`https://api.spotifydown.com/search/${encodeURIComponent(query)}`);
            const tracks = response.data.tracks.items;

            if (tracks.length > 0) {
                const track = tracks[0];
                const songInfo = `╭─❒ 『 SPOTIFY DOWNLOAD 』 ❒
│ 
├─❒ 🎵 *Title:* ${track.name}
├─❒ 👤 *Artist:* ${track.artists[0].name}
├─❒ 💽 *Album:* ${track.album.name}
├─❒ 📅 *Release:* ${track.album.release_date}
├─❒ ⏱️ *Duration:* ${this.formatDuration(track.duration_ms)}
│
├─❒ 📊 *Statistics*
│ • Popularity: ${track.popularity}%
│ • Track Number: ${track.track_number}
│
╰──────────────────❒`;

                // Send song info with album art
                await message.client.sendMessage(message.key.remoteJid, {
                    image: { url: track.album.images[0].url },
                    caption: songInfo,
                    footer: '🎵 Powered by Dineth MD'
                });

                // Download and send audio
                await message.client.sendMessage(message.key.remoteJid, {
                    audio: { url: track.preview_url },
                    mimetype: 'audio/mp4',
                    fileName: `${track.name}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: track.name,
                            body: track.artists[0].name,
                            mediaType: 2,
                            thumbnail: await this.getBuffer(track.album.images[0].url),
                            mediaUrl: track.external_urls.spotify
                        }
                    }
                });
            } else {
                message.reply('❌ Song not found! Try another query.');
            }
        } catch (error) {
            console.error('Spotify error:', error);
            message.reply('❌ Failed to process Spotify request.');
        }
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    }

    async getBuffer(url) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    }
}

module.exports = SpotifyCommand; 