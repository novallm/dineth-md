const Command = require('../../structures/Command');
const axios = require('axios');

class CurrencyCommand extends Command {
    constructor() {
        super({
            name: 'currency',
            description: 'Convert currencies',
            category: 'tools',
            usage: '!currency <amount> <from> <to>',
            cooldown: 5
        });
    }

    async execute(message, args) {
        if (args.length < 3) {
            return message.reply('Please provide amount, from and to currencies!\nExample: !currency 100 USD EUR');
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();

        if (isNaN(amount)) {
            return message.reply('Please provide a valid amount!');
        }

        try {
            const response = await axios.get(
                `https://api.exchangerate-api.com/v4/latest/${from}`
            );

            const rate = response.data.rates[to];
            if (!rate) {
                throw new Error('Invalid currency code');
            }

            const converted = (amount * rate).toFixed(2);
            const result = `💱 *Currency Conversion*\n\n` +
                `${amount} ${from} = ${converted} ${to}\n` +
                `Rate: 1 ${from} = ${rate} ${to}`;

            await message.client.sendText(message.key.remoteJid, result);
        } catch (error) {
            console.error('Currency conversion error:', error);
            message.reply('❌ Failed to convert currency. Please check the currency codes.');
        }
    }
}

module.exports = CurrencyCommand; 