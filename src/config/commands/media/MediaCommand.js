const Command = require('../../../structures/Command');

class MediaCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'media',
			description: 'Advanced media processing features',
			usage: '.media <filter|convert|watermark|compress|extract> [options]',
			aliases: ['m'],
			category: 'media'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .media <filter|convert|watermark|compress|extract> [options]');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'filter':
				return await this.handleFilter(message, args.slice(1));
			case 'convert':
				return await this.handleConvert(message, args.slice(1));
			case 'watermark':
				return await this.handleWatermark(message, args.slice(1));
			case 'compress':
				return await this.handleCompress(message, args.slice(1));
			case 'extract':
				return await this.handleExtract(message, args.slice(1));
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: filter, convert, watermark, compress, extract');
		}
	}

	async handleFilter(message, args) {
		if (!args.length) {
			const filters = Array.from(this.bot.mediaHandler.filters.keys()).join(', ');
			return await this.bot.sendText(message.key.remoteJid, `Available filters: ${filters}`);
		}

		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.imageMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to an image with .media filter <filter name>');
		}

		try {
			const buffer = await this.bot.downloadMedia(quotedMessage.imageMessage);
			const filtered = await this.bot.mediaHandler.processImage(buffer, [
				{ type: 'filter', name: args[0] }
			]);
			return await this.bot.sendImage(message.key.remoteJid, filtered, `Applied filter: ${args[0]}`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Filter application failed: ${error.message}`);
		}
	}

	async handleConvert(message, args) {
		if (args.length < 1) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .media convert <format>');
		}

		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.imageMessage && !quotedMessage?.videoMessage && !quotedMessage?.audioMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to a media message');
		}

		try {
			const buffer = await this.bot.downloadMedia(quotedMessage.imageMessage || quotedMessage.videoMessage || quotedMessage.audioMessage);
			const converted = await this.bot.mediaHandler.convertFormat(buffer, '', args[0]);
			return await this.bot.sendMessage(message.key.remoteJid, {
				[args[0].includes('mp4') ? 'video' : 'document']: converted,
				mimetype: `${args[0].includes('mp4') ? 'video' : 'application'}/${args[0]}`
			});
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Conversion failed: ${error.message}`);
		}
	}

	async handleWatermark(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .media watermark <text>');
		}

		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.imageMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to an image');
		}

		try {
			const buffer = await this.bot.downloadMedia(quotedMessage.imageMessage);
			const watermarked = await this.bot.mediaHandler.addWatermark(buffer, args.join(' '));
			return await this.bot.sendImage(message.key.remoteJid, watermarked, 'Watermarked image');
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Watermark failed: ${error.message}`);
		}
	}

	async handleCompress(message, args) {
		const quality = args[0] ? parseInt(args[0]) : 80;
		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		
		if (!quotedMessage?.imageMessage && !quotedMessage?.videoMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to an image or video');
		}

		try {
			const buffer = await this.bot.downloadMedia(quotedMessage.imageMessage || quotedMessage.videoMessage);
			const compressed = await this.bot.mediaHandler.processImage(buffer, [
				{ type: 'compress', quality }
			]);
			return await this.bot.sendImage(message.key.remoteJid, compressed, `Compressed with quality: ${quality}%`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Compression failed: ${error.message}`);
		}
	}

	async handleExtract(message, args) {
		const frameCount = args[0] ? parseInt(args[0]) : 1;
		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		
		if (!quotedMessage?.videoMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to a video');
		}

		try {
			const buffer = await this.bot.downloadMedia(quotedMessage.videoMessage);
			const frames = await this.bot.mediaHandler.extractFrames(buffer, frameCount);
			
			for (const frame of frames) {
				await this.bot.sendImage(message.key.remoteJid, frame, 'Extracted frame');
			}
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Frame extraction failed: ${error.message}`);
		}
	}
}

module.exports = MediaCommand;