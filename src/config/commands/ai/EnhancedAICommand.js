const Command = require('../../../structures/Command');

class EnhancedAICommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ai',
			description: 'Advanced AI features including chat, image generation, and analysis',
			usage: '.ai <chat|image|analyze|tts|translate> [options]',
			aliases: ['gpt', 'dall-e'],
			category: 'ai'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .ai <chat|image|analyze|tts|translate> [options]');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'chat':
				return await this.handleChat(message, args.slice(1));
			case 'image':
				return await this.handleImage(message, args.slice(1));
			case 'analyze':
				return await this.handleAnalyze(message);
			case 'tts':
				return await this.handleTTS(message, args.slice(1));
			case 'translate':
				return await this.handleTranslate(message, args.slice(1));
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: chat, image, analyze, tts, translate');
		}
	}

	async handleChat(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Please provide a message to chat with AI');
		}

		try {
			const response = await this.bot.aiHandler.chatCompletion(message);
			return await this.bot.sendText(message.key.remoteJid, response);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `AI chat error: ${error.message}`);
		}
	}

	async handleImage(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .ai image <prompt> [style]');
		}

		const style = args[args.length - 1].startsWith('style:') ? 
			args.pop().split(':')[1] : 'natural';
		const prompt = args.join(' ');

		try {
			const imageUrl = await this.bot.aiHandler.generateImage(prompt, style);
			return await this.bot.sendImage(message.key.remoteJid, imageUrl, `🎨 Generated: ${prompt}`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Image generation error: ${error.message}`);
		}
	}

	async handleAnalyze(message) {
		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.imageMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to an image with .ai analyze');
		}

		try {
			const imageUrl = quotedMessage.imageMessage.url;
			const prompt = message.message.conversation || 'Analyze this image in detail';
			const analysis = await this.bot.aiHandler.analyzeImage(imageUrl, prompt);
			return await this.bot.sendText(message.key.remoteJid, analysis);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Image analysis error: ${error.message}`);
		}
	}

	async handleTTS(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .ai tts <text> [voice]');
		}

		const voice = args[args.length - 1].startsWith('voice:') ? 
			args.pop().split(':')[1] : 'alloy';
		const text = args.join(' ');

		try {
			const audioData = await this.bot.aiHandler.textToSpeech(text, voice);
			return await this.bot.sendMessage(message.key.remoteJid, {
				audio: audioData,
				mimetype: 'audio/mp3',
				ptt: true
			});
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Text to speech error: ${error.message}`);
		}
	}

	async handleTranslate(message, args) {
		if (args.length < 2) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .ai translate <target_lang> <text>');
		}

		const targetLang = args[0];
		const text = args.slice(1).join(' ');

		try {
			const translation = await this.bot.aiHandler.translateText(text, targetLang);
			return await this.bot.sendText(
				message.key.remoteJid,
				`Translation (${targetLang}):\n${translation}`
			);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Translation error: ${error.message}`);
		}
	}
}

module.exports = EnhancedAICommand;