const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

class ImageGeneratorCommand {
	constructor(bot) {
		this.bot = bot;
		this.command = 'image';
		this.aliases = ['img', 'generate'];
		this.description = 'Generate images using AI or apply effects';
	}

	async execute(message, args) {
		const [subcommand, ...params] = args;
		
		switch (subcommand) {
			case 'ai':
				return await this.generateAIImage(message, params.join(' '));
			case 'meme':
				return await this.createMeme(message, params);
			case 'filter':
				return await this.applyFilter(message, params);
			case 'merge':
				return await this.mergeImages(message);
			default:
				return 'Available subcommands: ai, meme, filter, merge';
		}
	}

	async generateAIImage(message, prompt) {
		try {
			const response = await this.bot.ai.generateImage(prompt);
			await this.bot.sock.sendMessage(message.key.remoteJid, {
				image: { url: response },
				caption: `🎨 Generated: ${prompt}`
			});
		} catch (error) {
			throw new Error(`Failed to generate AI image: ${error.message}`);
		}
	}

	async createMeme(message, [topText, bottomText]) {
		if (!message.hasMedia) {
			throw new Error('Please send an image with the command');
		}

		const canvas = createCanvas(800, 600);
		const ctx = canvas.getContext('2d');
		
		// Load and draw image
		const image = await loadImage(message.mediaData.url);
		ctx.drawImage(image, 0, 0, 800, 600);

		// Add meme text
		ctx.font = '40px Impact';
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.textAlign = 'center';

		// Top text
		ctx.fillText(topText.toUpperCase(), 400, 50);
		ctx.strokeText(topText.toUpperCase(), 400, 50);

		// Bottom text
		ctx.fillText(bottomText.toUpperCase(), 400, 550);
		ctx.strokeText(bottomText.toUpperCase(), 400, 550);

		await this.bot.sock.sendMessage(message.key.remoteJid, {
			image: canvas.toBuffer(),
			caption: '🎭 Meme generated!'
		});
	}

	async applyFilter(message, [filter]) {
		if (!message.hasMedia) {
			throw new Error('Please send an image with the command');
		}

		const filters = {
			grayscale: [
				['grayscale', '100%']
			],
			sepia: [
				['sepia', '80%']
			],
			blur: [
				['blur', '5px']
			],
			sharpen: [
				['sharpen', '5']
			],
			vintage: [
				['sepia', '50%'],
				['hue-rotate', '30deg']
			]
		};

		if (!filters[filter]) {
			return 'Available filters: grayscale, sepia, blur, sharpen, vintage';
		}

		const canvas = createCanvas(800, 600);
		const ctx = canvas.getContext('2d');
		const image = await loadImage(message.mediaData.url);
		
		ctx.filter = filters[filter].map(([name, value]) => `${name}(${value})`).join(' ');
		ctx.drawImage(image, 0, 0, 800, 600);

		await this.bot.sock.sendMessage(message.key.remoteJid, {
			image: canvas.toBuffer(),
			caption: `🎨 Filter applied: ${filter}`
		});
	}

	async mergeImages(message) {
		if (!message.quoted || !message.hasMedia) {
			throw new Error('Please reply to another image and send an image to merge');
		}

		const canvas = createCanvas(800, 600);
		const ctx = canvas.getContext('2d');

		// Load both images
		const image1 = await loadImage(message.mediaData.url);
		const image2 = await loadImage(message.quoted.mediaData.url);

		// Draw images side by side
		ctx.drawImage(image1, 0, 0, 400, 600);
		ctx.drawImage(image2, 400, 0, 400, 600);

		await this.bot.sock.sendMessage(message.key.remoteJid, {
			image: canvas.toBuffer(),
			caption: '🔄 Images merged!'
		});
	}
}

module.exports = ImageGeneratorCommand;