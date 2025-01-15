const Command = require('../../structures/Command');

class KickAllCommand extends Command {
    constructor() {
        super({
            name: 'kickall',
            description: 'Kick all members from group',
            category: 'group',
            usage: '.kickall',
            groupOnly: true,
            adminOnly: true
        });
    }

    async execute(message) {
        try {
            const group = await message.client.groupMetadata(message.key.remoteJid);
            const isAdmin = await this.isGroupAdmin(message);
            
            if (!isAdmin) {
                return message.reply('❌ This command is only for group admins!');
            }

            const confirmMsg = await message.reply(`⚠️ *WARNING*\n\nYou are about to kick all members (${group.participants.length - 1} members).\nAre you sure? Reply with 'yes' to confirm.`);

            // Wait for confirmation
            const filter = m => m.key.participant === message.key.participant;
            const collector = message.client.createMessageCollector(message.key.remoteJid, filter, {
                time: 30000,
                max: 1
            });

            collector.on('collect', async msg => {
                if (msg.message?.conversation?.toLowerCase() === 'yes') {
                    await message.reply('🚫 Starting mass kick...');
                    
                    let kicked = 0;
                    for (const participant of group.participants) {
                        if (participant.id !== message.key.participant && !participant.admin) {
                            try {
                                await message.client.groupParticipantsUpdate(
                                    message.key.remoteJid,
                                    [participant.id],
                                    "remove"
                                );
                                kicked++;
                                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limits
                            } catch (error) {
                                console.error(`Failed to kick ${participant.id}:`, error);
                            }
                        }
                    }

                    await message.reply(`✅ Kicked ${kicked} members from the group.`);
                } else {
                    await message.reply('❌ Kickall command cancelled.');
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    message.reply('❌ Kickall command timed out.');
                }
            });

        } catch (error) {
            console.error('Kickall error:', error);
            message.reply('❌ Failed to kick members.');
        }
    }

    async isGroupAdmin(message) {
        const groupMetadata = await message.client.groupMetadata(message.key.remoteJid);
        const participant = message.key.participant || message.key.remoteJid;
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        return admins.includes(participant);
    }
}

module.exports = KickAllCommand; 