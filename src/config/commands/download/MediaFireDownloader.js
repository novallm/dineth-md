const Command = require('../../structures/Command');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class MediaFireDownloader extends Command {
    constructor() {
        super({
            name: 'mediafire',
            aliases: ['mf', 'mfdl'],
            description: 'Download MediaFire files',
            category: 'download',
            usage: '.mediafire <url>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 MEDIAFIRE DL 』 ❒
│
├─❒ 📥 *Commands*
│ • .mf <url> - Download file
│ • .mf info <url> - File info
│
├─❒ 📊 *Features*
│ • Direct Download
│ • Size Check
│ • Virus Scan
│
╰──────────────────❒`);
        }

        await message.reply('⏳ *Processing MediaFire link...*');

        try {
            const url = args[0];
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            
            const fileName = $('.filename').text().trim();
            const fileSize = $('.details').text().match(/\((.*?)\)/)[1];
            const downloadUrl = $('.download_link a').attr('href');

            await message.reply(`📁 *File Details*\n\nName: ${fileName}\nSize: ${fileSize}\n\n⏳ Starting download...`);

            const tempPath = path.join(__dirname, '../../../temp', fileName);
            const fileResponse = await axios({
                method: 'GET',
                url: downloadUrl,
                responseType: 'stream'
            });

            await new Promise((resolve, reject) => {
                const stream = fs.createWriteStream(tempPath);
                fileResponse.data.pipe(stream);
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            await message.client.sendMessage(message.key.remoteJid, {
                document: { url: tempPath },
                fileName: fileName,
                mimetype: 'application/octet-stream'
            });

            await fs.unlink(tempPath);
        } catch (error) {
            console.error('MediaFire download error:', error);
            message.reply('❌ Failed to download. Please check the URL.');
        }
    }
}

module.exports = MediaFireDownloader; 