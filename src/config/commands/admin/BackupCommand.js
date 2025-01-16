const Command = require('../../../structures/Command');
const path = require('path');
const fs = require('fs').promises;

class BackupCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'backup',
			description: 'Manage chat backups',
			usage: '.backup <create|load|list>',
			aliases: ['bak'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .backup <create|load|list>');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'create':
				return await this.handleCreate(message);
			case 'load':
				return await this.handleLoad(message, args[1]);
			case 'list':
				return await this.handleList(message);
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: create, load, list');
		}
	}

	async handleCreate(message) {
		try {
			const backupFile = await this.bot.backupHandler.saveBackup();
			const filename = path.basename(backupFile);
			return await this.bot.sendText(message.key.remoteJid, `Backup created successfully: ${filename}`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Failed to create backup: ${error.message}`);
		}
	}

	async handleLoad(message, backupName) {
		if (!backupName) {
			try {
				const loaded = await this.bot.loadLatestBackup();
				return await this.bot.sendText(
					message.key.remoteJid, 
					loaded ? 'Latest backup loaded successfully' : 'No backup found to load'
				);
			} catch (error) {
				return await this.bot.sendText(message.key.remoteJid, `Failed to load backup: ${error.message}`);
			}
		}

		const backupPath = path.join(this.bot.backupHandler.backupPath, backupName);
		try {
			const loaded = await this.bot.backupHandler.loadBackup(backupPath);
			return await this.bot.sendText(
				message.key.remoteJid,
				loaded ? `Backup ${backupName} loaded successfully` : `Failed to load backup ${backupName}`
			);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Failed to load backup: ${error.message}`);
		}
	}

	async handleList(message) {
		try {
			const files = await fs.readdir(this.bot.backupHandler.backupPath);
			const backups = files
				.filter(f => f.startsWith('backup-'))
				.sort()
				.reverse()
				.slice(0, 10); // Show only last 10 backups

			if (!backups.length) {
				return await this.bot.sendText(message.key.remoteJid, 'No backups found');
			}

			const backupList = backups
				.map((f, i) => `${i + 1}. ${f}`)
				.join('\n');

			return await this.bot.sendText(message.key.remoteJid, `Available backups:\n${backupList}`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Failed to list backups: ${error.message}`);
		}
	}
}

module.exports = BackupCommand;