const Command = require('../../structures/Command');

class OwnerCommand extends Command {
    constructor() {
        super({
            name: 'owner',
            aliases: ['creator', 'dev'],
            description: 'Get bot owner information',
            category: 'info'
        });
    }

    async execute(message) {
        const ownerInfo = `╭────❒ 『 OWNER INFO 』 ❒────
│ *Name:* Dineth Nethsara
│ *Age:* 17
│ *Country:* Sri Lanka 🇱🇰
│ *Status:* Available ✅
╰────────────────────❒

*Contact Information:*
• WhatsApp: wa.me/94741566800
• Instagram: @dineth_nethsara
• GitHub: github.com/DinethNethsara
• Email: dinethnethsara@gmail.com

*Support Group:*
https://chat.whatsapp.com/xxx

*Bot Channel:*
https://whatsapp.com/channel/xxx

*Note:*
Don't spam or you'll be blocked!
For business inquiries only.`;

        // Send owner info with profile picture
        await message.client.sendMessage(message.key.remoteJid, {
            image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/owner.jpg' },
            caption: ownerInfo,
            footer: '© Dineth MD Bot 2024',
            buttons: [
                { buttonId: '.alive', buttonText: { displayText: 'Bot Status' }, type: 1 },
                { buttonId: '.support', buttonText: { displayText: 'Support' }, type: 1 }
            ]
        });

        // Send owner contact card
        await message.client.sendContact(message.key.remoteJid, {
            displayName: "Dineth Nethsara",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Dineth Nethsara
ORG:Dineth MD Bot;
TEL;type=CELL;type=VOICE;waid=94741566800:+94 741 566 800
EMAIL:dinethnethsara@gmail.com
URL:https://github.com/DinethNethsara
ADR:;;Sri Lanka;;;;
END:VCARD`
        });
    }
}

module.exports = OwnerCommand; 