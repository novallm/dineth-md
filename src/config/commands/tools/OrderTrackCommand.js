const Command = require('../../structures/Command');
const session = require('../../utils/SessionManager');

class OrderTrackCommand extends Command {
    constructor() {
        super({
            name: 'order',
            aliases: ['track', 'delivery'],
            description: 'Order tracking system',
            category: 'tools'
        });
    }

    async execute(message, args) {
        const action = args[0]?.toLowerCase();
        const userId = message.key.participant || message.key.remoteJid;
        const user = session.getUser(userId);

        if (!user.orders) {
            user.orders = {
                active: [],
                completed: [],
                settings: {}
            };
        }

        const orderMenu = `╭─❒ 『 ORDER TRACKING 』 ❒
│
├─❒ 📦 *Active Orders:* ${user.orders.active.length}
├─❒ ✅ *Completed:* ${user.orders.completed.length}
│
├─❒ 🔍 *Commands:*
│ • .order track <id>
│ • .order list
│ • .order add <details>
│ • .order update <id>
│ • .order cancel <id>
│
├─❒ 📊 *Statistics:*
│ • Total Orders: ${user.orders.active.length + user.orders.completed.length}
│ • Pending: ${user.orders.active.filter(o => o.status === 'pending').length}
│ • In Transit: ${user.orders.active.filter(o => o.status === 'transit').length}
│
╰──────────────────❒`;

        if (!action) return message.reply(orderMenu);

        try {
            switch(action) {
                case 'track':
                    await this.trackOrder(message, args[1], user);
                    break;
                case 'list':
                    await this.listOrders(message, user);
                    break;
                case 'add':
                    await this.addOrder(message, args.slice(1).join(' '), user);
                    break;
                case 'update':
                    await this.updateOrder(message, args[1], user);
                    break;
                case 'cancel':
                    await this.cancelOrder(message, args[1], user);
                    break;
            }
        } catch (error) {
            console.error('Order tracking error:', error);
            message.reply('❌ Failed to process order request.');
        }
    }

    async trackOrder(message, orderId, user) {
        const order = user.orders.active.find(o => o.id === orderId);
        if (!order) return message.reply('❌ Order not found!');

        const trackingInfo = `╭─❒ 『 ORDER STATUS 』 ❒
│
├─❒ 📦 *Order #${order.id}*
├─❒ 📅 Date: ${order.date}
├─❒ 💰 Amount: $${order.amount}
│
├─❒ 📍 *Current Status:*
│ ${this.getStatusEmoji(order.status)} ${order.status.toUpperCase()}
│
├─❒ 📝 *Timeline:*
${order.timeline.map(t => `│ ${t.time}: ${t.status}`).join('\n')}
│
├─❒ 🚚 *Delivery Estimate:*
│ ${order.estimatedDelivery}
│
╰──────────────────❒`;

        await message.reply(trackingInfo);
    }

    getStatusEmoji(status) {
        const emojis = {
            'pending': '⏳',
            'processing': '⚙️',
            'transit': '🚚',
            'delivered': '✅',
            'cancelled': '❌'
        };
        return emojis[status] || '📦';
    }

    // Implement other tracking methods...
}

module.exports = OrderTrackCommand; 