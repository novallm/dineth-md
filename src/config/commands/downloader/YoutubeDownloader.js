const Command = require('../../structures/Command');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs').promises;
const path = require('path');

class YoutubeDownloader extends Command {
    constructor() {
        super({
            name: 'yt',
            aliases: ['youtube'],
            description: 'Download YouTube videos/audio',
            category: 'downloader',
            usage: '!yt <url> [audio/video/mp3]'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('*Please provide a YouTube URL!*\n\nExample: !yt https://youtube.com/watch?v=xxx audio');
        }

        const url = args[0];
        const type = args[1]?.toLowerCase() || 'video';

        try {
            await message.reply('⏳ *Processing your request...*');

            // Use RapidAPI YouTube Downloader (Free tier)
            const response = await axios.get('https://youtube-video-download-info.p.rapidapi.com/dl', {
                params: { id: this.getVideoId(url) },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                    'X-RapidAPI-Host': 'youtube-video-download-info.p.rapidapi.com'
                }
            });

            const videoInfo = response.data;
            const caption = `🎥 *${videoInfo.title}*\n\n` +
                          `👤 Channel: ${videoInfo.author}\n` +
                          `⏱️ Duration: ${videoInfo.length}\n` +
                          `👁️ Views: ${videoInfo.views}\n\n` +
                          `✅ Downloaded by Dineth MD`;

            if (type === 'audio' || type === 'mp3') {
                const audioUrl = videoInfo.link.find(l => l.type === 'mp3')?.url;
                await message.client.sendMessage(message.key.remoteJid, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mp4',
                    fileName: `${videoInfo.title}.mp3`
                });
            } else {
                const videoUrl = videoInfo.link.find(l => l.type === 'mp4' && l.quality === '720p')?.url;
                await message.client.sendMessage(message.key.remoteJid, {
                    video: { url: videoUrl },
                    caption: caption
                });
            }
        } catch (error) {
            console.error('YouTube download error:', error);
            message.reply('❌ Failed to download. Please try another video or format.');
        }
    }

    getVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : url;
    }
}

module.exports = YoutubeDownloader; 