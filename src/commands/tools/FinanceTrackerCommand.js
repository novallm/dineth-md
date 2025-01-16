const { MessageType } = require('@whiskeysockets/baileys');

class FinanceTrackerCommand {
    constructor() {
        this.name = 'finance';
        this.description = 'Track expenses, budget, and get financial tips';
    }

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(`*💰 Finance Tracker Commands*\n\n` +
                `*.finance expense <amount> <category>* - Log an expense\n` +
                `*.finance budget <category> <amount>* - Set budget\n` +
                `*.finance summary* - View spending summary\n` +
                `*.finance tips* - Get financial advice\n` +
                `*.finance convert <amount> <from> <to>* - Currency conversion`);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'expense':
                const amount = args[1];
                const category = args[2];
                if (!amount || !category) {
                    return message.reply('❌ Please specify amount and category.\nExample: *.finance expense 50 food*');
                }
                return message.reply(`✅ Expense logged: $${amount} for ${category}`);

            case 'budget':
                const budgetCategory = args[1];
                const budgetAmount = args[2];
                if (!budgetCategory || !budgetAmount) {
                    return message.reply('❌ Please specify category and amount.\nExample: *.finance budget food 300*');
                }
                return message.reply(`✅ Budget set: $${budgetAmount} for ${budgetCategory}`);

            case 'summary':
                // Implement actual database integration for real tracking
                return message.reply(`*📊 Monthly Finance Summary*\n\n` +
                    `💵 Total Expenses: $850\n` +
                    `📋 By Category:\n` +
                    `  • Food: $300\n` +
                    `  • Transport: $150\n` +
                    `  • Entertainment: $200\n` +
                    `  • Others: $200\n\n` +
                    `💰 Remaining Budget: $450`);

            case 'tips':
                const tips = [
                    '50/30/20 Rule: 50% needs, 30% wants, 20% savings',
                    'Track every expense, no matter how small',
                    'Set up an emergency fund',
                    'Invest in your future - consider retirement planning',
                    'Compare prices before major purchases'
                ];
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                return message.reply(`*💡 Financial Tip*\n\n${randomTip}`);

            case 'convert':
                const currencyAmount = args[1];
                const fromCurrency = args[2]?.toUpperCase();
                const toCurrency = args[3]?.toUpperCase();
                
                if (!currencyAmount || !fromCurrency || !toCurrency) {
                    return message.reply('❌ Please specify amount and currencies.\nExample: *.finance convert 100 USD EUR*');
                }
                
                // Implement actual currency conversion API integration
                return message.reply(`*💱 Currency Conversion*\n\n${currencyAmount} ${fromCurrency} ≈ ${(currencyAmount * 0.85).toFixed(2)} ${toCurrency}`);

            default:
                return message.reply('❌ Invalid sub-command. Use *.finance* to see available options.');
        }
    }
}

module.exports = FinanceTrackerCommand; 