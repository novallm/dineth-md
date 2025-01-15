const Command = require('../../structures/Command');
const axios = require('axios');

class BibleCommand extends Command {
    constructor() {
        super({
            name: 'bible',
            aliases: ['verse', 'holy'],
            description: 'Get Bible verses and quotes',
            category: 'religion',
            usage: '.bible <book> <chapter:verse>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            // Send random verse if no specific verse requested
            return this.sendRandomVerse(message);
        }

        const reference = args.join(' ');
        try {
            const verse = await this.getVerse(reference);
            const verseText = `╭─❒ 『 HOLY BIBLE 』 ❒
│
├─❒ 📖 *${verse.reference}*
│
${this.formatVerseText(verse.text)}
│
├─❒ 📚 *Book:* ${verse.book}
├─❒ 📑 *Chapter:* ${verse.chapter}
├─❒ 🔢 *Verse:* ${verse.verse}
│
╰──────────────────❒

Type .bible list for available books
Type .bible daily for daily verse`;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/bible.jpg' },
                caption: verseText,
                footer: '✝️ Powered by Dineth MD'
            });
        } catch (error) {
            console.error('Bible command error:', error);
            message.reply('❌ Error fetching verse. Please check the reference.');
        }
    }

    async sendRandomVerse(message) {
        try {
            const response = await axios.get('https://bible-api.com/random');
            const verse = response.data;

            const verseText = `╭─❒ 『 DAILY VERSE 』 ❒
│
├─❒ 🕊️ *Today's Verse*
│
${this.formatVerseText(verse.text)}
│
├─❒ 📖 *Reference:* ${verse.reference}
│
╰──────────────────❒`;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/bible_daily.jpg' },
                caption: verseText,
                footer: '✝️ Daily Bible Verse'
            });
        } catch (error) {
            console.error('Random verse error:', error);
            message.reply('❌ Failed to get random verse.');
        }
    }

    async getVerse(reference) {
        const response = await axios.get(`https://bible-api.com/${encodeURIComponent(reference)}`);
        return response.data;
    }

    formatVerseText(text) {
        return text.split('\n').map(line => `│ ${line}`).join('\n');
    }
}

module.exports = BibleCommand; 