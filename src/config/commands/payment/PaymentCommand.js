const Command = require('../../structures/Command');
const session = require('../../utils/SessionManager');

class PaymentCommand extends Command {
    constructor() {
        super({
            name: 'pay',
            aliases: ['wallet', 'balance'],
            description: 'Virtual payment system',
            category: 'economy'
        });
    }

    async execute(message, args) {
        const action = args[0]?.toLowerCase();
        const userId = message.key.participant || message.key.remoteJid;
        const user = session.getUser(userId);

        if (!user.wallet) {
            user.wallet = {
                balance: 1000, // Starting balance
                transactions: [],
                inventory: []
            };
        }

        const walletMenu = `╭─❒ 『 VIRTUAL WALLET 』 ❒
│
├─❒ 👤 *User:* @${userId.split('@')[0]}
├─❒ 💰 *Balance:* $${user.wallet.balance}
│
├─❒ 💳 *Commands*
│ • .pay send @user <amount>
│ • .pay check @user
│ • .pay history
│ • .pay shop
│ • .pay daily
│
├─❒ 📊 *Statistics*
│ • Transactions: ${user.wallet.transactions.length}
│ • Items owned: ${user.wallet.inventory.length}
│
╰──────────────────❒`;

        if (!action) return message.reply(walletMenu);

        try {
            switch(action) {
                case 'send':
                    await this.sendMoney(message, args);
                    break;
                case 'check':
                    await this.checkBalance(message, args[1]);
                    break;
                case 'history':
                    await this.showHistory(message);
                    break;
                case 'shop':
                    await this.showShop(message);
                    break;
                case 'daily':
                    await this.claimDaily(message);
                    break;
                default:
                    await message.reply('❌ Invalid payment command!');
            }
        } catch (error) {
            console.error('Payment error:', error);
            message.reply('❌ Transaction failed.');
        }
    }

    // Implement other methods...
}

module.exports = PaymentCommand; 