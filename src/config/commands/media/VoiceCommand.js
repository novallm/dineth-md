const Command = require('../../../structures/Command');

class VoiceCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'voice',
			description: 'Advanced voice message processing',
			usage: '.voice <transcribe|effect|enhance|convert|tts>',
			aliases: ['audio'],
			category: 'media'
		});
	}

	async execute(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .voice <transcribe|effect|enhance|convert|tts>');
		}

		const subCommand = args[0].toLowerCase();
		switch (subCommand) {
			case 'transcribe':
				return await this.handleTranscribe(message);
			case 'effect':
				return await this.handleEffect(message, args.slice(1));
			case 'enhance':
				return await this.handleEnhance(message);
			case 'convert':
				return await this.handleConvert(message, args[1]);
			case 'tts':
				return await this.handleTTS(message, args.slice(1));
			default:
				return await this.bot.sendText(message.key.remoteJid, 'Invalid subcommand. Available: transcribe, effect, enhance, convert, tts');
		}
	}

	async handleTranscribe(message) {
		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.audioMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to a voice message with .voice transcribe');
		}

		try {
			const audioBuffer = await this.bot.downloadMedia(quotedMessage.audioMessage);
			const transcription = await this.bot.voiceHandler.transcribeVoice(audioBuffer);
			return await this.bot.sendText(message.key.remoteJid, `📝 Transcription:\n${transcription}`);
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Transcription failed: ${error.message}`);
		}
	}

	async handleEffect(message, args) {
		if (!args.length) {
			const effects = Array.from(this.bot.voiceHandler.voiceEffects.keys()).join(', ');
			return await this.bot.sendText(message.key.remoteJid, `Available effects: ${effects}`);
		}

		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.audioMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to a voice message with .voice effect <effect>');
		}

		try {
			const audioBuffer = await this.bot.downloadMedia(quotedMessage.audioMessage);
			const modifiedAudio = await this.bot.voiceHandler.applyVoiceEffect(audioBuffer, args[0]);
			return await this.bot.sendMessage(message.key.remoteJid, {
				audio: modifiedAudio,
				mimetype: 'audio/mp4',
				ptt: true
			});
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Effect application failed: ${error.message}`);
		}
	}

	async handleEnhance(message) {
		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.audioMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to a voice message with .voice enhance');
		}

		try {
			const audioBuffer = await this.bot.downloadMedia(quotedMessage.audioMessage);
			const enhancedAudio = await this.bot.voiceHandler.enhanceAudioQuality(audioBuffer);
			return await this.bot.sendMessage(message.key.remoteJid, {
				audio: enhancedAudio,
				mimetype: 'audio/mp4',
				ptt: true
			});
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Enhancement failed: ${error.message}`);
		}
	}

	async handleConvert(message, format) {
		if (!format) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .voice convert <mp3|wav|ogg>');
		}

		const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
		if (!quotedMessage?.audioMessage) {
			return await this.bot.sendText(message.key.remoteJid, 'Please reply to a voice message');
		}

		try {
			const audioBuffer = await this.bot.downloadMedia(quotedMessage.audioMessage);
			const convertedAudio = await this.bot.voiceHandler.convertVoiceNote(audioBuffer, format);
			return await this.bot.sendMessage(message.key.remoteJid, {
				audio: convertedAudio,
				mimetype: `audio/${format}`
			});
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `Conversion failed: ${error.message}`);
		}
	}

	async handleTTS(message, args) {
		if (!args.length) {
			return await this.bot.sendText(message.key.remoteJid, 'Usage: .voice tts <text> [voice]');
		}

		const voice = args[args.length - 1].startsWith('voice:') ? 
			args.pop().split(':')[1] : 'default';
		const text = args.join(' ');

		try {
			const voiceNote = await this.bot.voiceHandler.createVoiceNote(text, voice);
			return await this.bot.sendMessage(message.key.remoteJid, {
				audio: voiceNote,
				mimetype: 'audio/mp4',
				ptt: true
			});
		} catch (error) {
			return await this.bot.sendText(message.key.remoteJid, `TTS failed: ${error.message}`);
		}
	}
}

module.exports = VoiceCommand;