const Command = require('../../structures/Command');
const { translate } = require('@vitalets/google-translate-api');

class TranslateCommand extends Command {
    constructor() {
        super({
            name: 'tr',
            description: 'Translate text to any language',
            category: 'tools',
            usage: '!tr <lang> <text>'
        });
    }

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('Please provide language and text!\nExample: !tr es Hello World');
        }

        const targetLang = args[0];
        const text = args.slice(1).join(' ');

        try {
            const result = await translate(text, { to: targetLang });
            
            const translationText = `🌐 *Translation*\n\n` +
                `📝 Original: ${text}\n` +
                `🔄 Translated (${targetLang}): ${result.text}`;

            await message.client.sendText(message.key.remoteJid, translationText);
        } catch (error) {
            console.error('Translation error:', error);
            message.reply('❌ Failed to translate. Please check the language code.');
        }
    }
}

module.exports = TranslateCommand; 