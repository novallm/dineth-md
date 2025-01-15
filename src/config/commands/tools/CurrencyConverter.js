const Command = require('../../structures/Command');
const axios = require('axios');

class CurrencyConverter extends Command {
    constructor() {
        super({
            name: 'currency',
            aliases: ['convert', 'forex'],
            description: 'Convert currencies',
            category: 'tools',
            usage: '.currency <amount> <from> <to>'
        });
    }

    async execute(message, args) {
        if (args.length < 3) {
            return message.reply(`╭─❒ 『 CURRENCY CONVERTER 』 ❒
│
├─❒ 💱 *Usage:*
│ .currency <amount> <from> <to>
│
├─❒ 📝 *Example:*
│ .currency 100 USD EUR
│
├─❒ 💹 *Popular Currencies:*
│ • USD - US Dollar
│ • EUR - Euro
│ • GBP - British Pound
│ • JPY - Japanese Yen
│ • AUD - Australian Dollar
│
╰──────────────────❒`);
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();

        if (isNaN(amount)) {
            return message.reply('❌ Please provide a valid amount!');
        }

        try {
            const response = await axios.get(
                `https://api.exchangerate-api.com/v4/latest/${from}`
            );

            const rate = response.data.rates[to];
            if (!rate) {
                throw new Error('Invalid currency code');
            }

            const result = amount * rate;
            const conversionText = `╭─❒ 『 CURRENCY CONVERSION 』 ❒
│
├─❒ 💰 *Amount:* ${amount} ${from}
├─❒ 💱 *Converted:* ${result.toFixed(2)} ${to}
├─❒ 📊 *Rate:* 1 ${from} = ${rate} ${to}
├─❒ 📅 *Last Updated:* ${new Date().toLocaleString()}
│
╰──────────────────❒`;

            await message.reply(conversionText);

        } catch (error) {
            console.error('Currency conversion error:', error);
            message.reply('❌ Failed to convert currency. Please check the currency codes.');
        }
    }
}

module.exports = CurrencyConverter; 