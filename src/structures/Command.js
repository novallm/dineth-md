class Command {
    constructor(options = {}) {
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.usage = options.usage;
        this.cooldown = options.cooldown || 3;
        this.permissions = options.permissions || [];
        this.ownerOnly = options.ownerOnly || false;
    }

    async execute(message, args) {
        throw new Error('Command execute method must be implemented');
    }
}

module.exports = Command; 