const Command = require('../../structures/Command');

class TagAllCommand extends Command {
    constructor() {
        super({
            name: 'tagall',
            description: 'Tag all group members',
            category: 'group',
            usage: '!tagall [message]',
            groupOnly: true,
            adminOnly: true
        });
    }

    async execute(message, args) {
        const groupMetadata = await message.client.sock.groupMetadata(message.key.remoteJid);
        const participants = groupMetadata.participants;

        let mentionText = args.join(' ') || '🔊 Group Announcement';
        mentionText += '\n\n';

        const mentions = participants.map(participant => ({
            tag: '@' + participant.id.split('@')[0],
            id: participant.id
        }));

        for (const mention of mentions) {
            mentionText += `${mention.tag}\n`;
        }

        await message.client.sendMessage(message.key.remoteJid, {
            text: mentionText,
            mentions: mentions.map(m => m.id)
        });
    }
}

module.exports = TagAllCommand; 