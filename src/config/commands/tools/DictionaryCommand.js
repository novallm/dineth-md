const Command = require('../../structures/Command');
const axios = require('axios');

class DictionaryCommand extends Command {
    constructor() {
        super({
            name: 'dict',
            aliases: ['define', 'word'],
            description: 'Look up word definitions',
            category: 'tools',
            usage: '.dict <word>'
        });
    }

    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`╭─❒ 『 DICTIONARY 』 ❒
│
├─❒ 📚 *Usage:*
│ .dict <word>
│
├─❒ 📝 *Example:*
│ .dict hello
│
├─❒ 🔍 *Features:*
│ • Definitions
│ • Synonyms
│ • Examples
│ • Phonetics
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const word = args[0].toLowerCase();
        await message.reply('🔍 *Searching dictionary...*');

        try {
            const response = await axios.get(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
            );

            const data = response.data[0];
            let definitionText = `╭─❒ 『 DICTIONARY 』 ❒
│
├─❒ 📝 *Word:* ${data.word}
├─❒ 🔊 *Phonetic:* ${data.phonetic || ''}
│
├─❒ 📚 *Definitions:*`;

            data.meanings.forEach((meaning, i) => {
                definitionText += `\n│ ${i + 1}. (${meaning.partOfSpeech})`;
                definitionText += `\n│    ${meaning.definitions[0].definition}`;
                if (meaning.definitions[0].example) {
                    definitionText += `\n│    Example: "${meaning.definitions[0].example}"`;
                }
            });

            definitionText += `\n│\n├─❒ ✨ *Powered by:* Dineth MD\n│\n╰──────────────────❒`;

            await message.reply(definitionText);

        } catch (error) {
            console.error('Dictionary error:', error);
            message.reply('❌ Word not found or service unavailable.');
        }
    }
}

module.exports = DictionaryCommand; 