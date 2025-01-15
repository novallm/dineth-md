const Command = require('../../structures/Command');
const translate = require('@vitalets/google-translate-api');

class TranslatorCommand extends Command {
    constructor() {
        super({
            name: 'translate',
            aliases: ['tr', 'tl'],
            description: 'Translate text to any language',
            category: 'tools',
            usage: '.tr <lang> <text>'
        });
    }

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply(`╭─❒ 『 TRANSLATOR 』 ❒
│
├─❒ 🌐 *Usage:*
│ .tr <lang> <text>
│
├─❒ 📝 *Example:*
│ .tr si Hello World
│
├─❒ 🗣️ *Languages:*
│ • si - Sinhala
│ • en - English
│ • ta - Tamil
│ • hi - Hindi
│ • ar - Arabic
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const targetLang = args[0];
        const text = args.slice(1).join(' ');

        try {
            const result = await translate(text, { to: targetLang });
            
            const translationText = `╭─❒ 『 TRANSLATION 』 ❒
│
├─❒ 📝 *Original:*
│ ${text}
│
├─❒ 🔄 *Translated:*
│ ${result.text}
│
├─❒ 🌐 *Language:* ${targetLang}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

            await message.reply(translationText);

        } catch (error) {
            console.error('Translation error:', error);
            message.reply('❌ Failed to translate. Please check the language code.');
        }
    }
}

module.exports = TranslatorCommand; 