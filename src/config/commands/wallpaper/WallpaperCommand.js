const Command = require('../../structures/Command');
const axios = require('axios');

class WallpaperCommand extends Command {
    constructor() {
        super({
            name: 'wall',
            aliases: ['wallpaper', 'wp'],
            description: 'Get HD wallpapers',
            category: 'wallpaper',
            usage: '.wall <query>'
        });
    }

    async execute(message, args) {
        if (!args.length) return message.reply('❌ Please provide a search query!');

        const query = args.join(' ');
        await message.reply('🔍 *Searching for wallpapers...*');

        try {
            // Using Unsplash API (free)
            const response = await axios.get(`https://api.unsplash.com/search/photos`, {
                params: {
                    query: query,
                    orientation: 'portrait',
                    per_page: 30,
                    client_id: process.env.UNSPLASH_API_KEY
                }
            });

            const photos = response.data.results;
            if (photos.length === 0) {
                return message.reply('❌ No wallpapers found!');
            }

            // Get random photo
            const photo = photos[Math.floor(Math.random() * photos.length)];

            const caption = `🖼️ *HD Wallpaper*\n\n` +
                          `📝 Query: ${query}\n` +
                          `📸 By: ${photo.user.name}\n` +
                          `📏 Resolution: ${photo.width}x${photo.height}\n` +
                          `❤️ Likes: ${photo.likes}\n\n` +
                          `✨ Downloaded via Dineth MD`;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: photo.urls.regular },
                caption: caption,
                footer: '🎨 Powered by Unsplash'
            });
        } catch (error) {
            console.error('Wallpaper error:', error);
            message.reply('❌ Failed to get wallpaper.');
        }
    }
}

module.exports = WallpaperCommand; 