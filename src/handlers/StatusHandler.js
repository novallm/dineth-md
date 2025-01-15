class StatusHandler {
    constructor(bot) {
        this.bot = bot;
    }

    async handleStatus(status) {
        try {
            // Auto view status
            await this.viewStatus(status);
            
            // Auto react to status
            await this.reactToStatus(status);
            
            // Save status if it's from important contact
            if (this.isImportantContact(status.participant)) {
                await this.saveStatus(status);
            }
        } catch (error) {
            console.error('Status handling error:', error);
        }
    }

    async viewStatus(status) {
        try {
            await this.bot.sock.readMessages([status.key]);
        } catch (error) {
            console.error('Status view error:', error);
        }
    }

    async reactToStatus(status) {
        // Different reactions based on status type
        let reaction = '👍';
        
        if (status.message?.imageMessage) {
            reaction = ['😍', '🔥', '💖', '👌'][Math.floor(Math.random() * 4)];
        } else if (status.message?.videoMessage) {
            reaction = ['🎥', '😮', '👏', '💫'][Math.floor(Math.random() * 4)];
        }

        await this.bot.sock.sendMessage(status.key.remoteJid, {
            react: {
                text: reaction,
                key: status.key
            }
        });
    }

    isImportantContact(jid) {
        // Add logic to determine important contacts
        const importantContacts = [
            this.bot.config.ownerNumber,
            // Add more numbers
        ];
        return importantContacts.includes(jid.split('@')[0]);
    }

    async saveStatus(status) {
        // Implement status saving logic
        // You can save to database or file
    }
}

module.exports = StatusHandler; 