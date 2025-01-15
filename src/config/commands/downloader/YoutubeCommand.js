const Command = require('../../structures/Command');
const ytdl = require('ytdl-core');
const axios = require('axios');

class YoutubeCommand extends Command {
    constructor() {
        super({
            name: 'yt',
            description: 'Download YouTube videos/audio',
            category: 'downloader',
            usage: '!yt <url> [audio/video]',
            cooldown: 10
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a YouTube URL!');
        }

        const url = args[0];
        const type = args[1]?.toLowerCase() || 'video';

        try {
            message.reply('⏳ Processing your request...');
            
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;

            if (type === 'audio') {
                const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
                await message.client.sendMessage(message.key.remoteJid, {
                    audio: { url: audioFormat.url },
                    mimetype: 'audio/mp4',
                    fileName: `${title}.mp3`
                });
            } else {
                const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
                await message.client.sendMessage(message.key.remoteJid, {
                    video: { url: videoFormat.url },
                    caption: `📹 *${title}*\n\n✅ Downloaded using Dineth MD V1`
                });
            }
        } catch (error) {
            console.error('YouTube download error:', error);
            message.reply('❌ Failed to download. Please try again later.');
        }
    }
}

module.exports = YoutubeCommand; 