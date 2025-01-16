const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

class MediaHandler {
	constructor(bot) {
		this.bot = bot;
		this.supportedFormats = {
			image: ['jpg', 'png', 'webp', 'gif'],
			video: ['mp4', 'mkv', 'avi'],
			audio: ['mp3', 'wav', 'ogg']
		};
		this.filters = new Map([
			['blur', { type: 'blur', sigma: 10 }],
			['sharpen', { type: 'sharpen', sigma: 1.5 }],
			['grayscale', { type: 'grayscale' }],
			['sepia', { type: 'sepia' }],
			['invert', { type: 'negate' }]
		]);
	}

	async processImage(buffer, operations = []) {
		let image = sharp(buffer);
		
		for (const op of operations) {
			switch (op.type) {
				case 'resize':
					image = image.resize(op.width, op.height, { fit: op.fit });
					break;
				case 'filter':
					const filter = this.filters.get(op.name);
					if (filter) {
						image = image[filter.type](filter.sigma);
					}
					break;
				case 'rotate':
					image = image.rotate(op.angle);
					break;
				case 'compress':
					image = image.jpeg({ quality: op.quality });
					break;
			}
		}
		
		return await image.toBuffer();
	}

	async addWatermark(buffer, text) {
		const image = sharp(buffer);
		const metadata = await image.metadata();
		
		const canvas = createCanvas(metadata.width, metadata.height);
		const ctx = canvas.getContext('2d');
		
		const img = await loadImage(buffer);
		ctx.drawImage(img, 0, 0);
		
		ctx.font = '48px Arial';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.fillText(text, 20, metadata.height - 20);
		
		return await sharp(canvas.toBuffer())
			.composite([{ input: buffer, blend: 'over' }])
			.toBuffer();
	}

	async processVideo(buffer, operations = []) {
		return new Promise((resolve, reject) => {
			let command = ffmpeg(buffer);
			
			for (const op of operations) {
				switch (op.type) {
					case 'resize':
						command = command.size(`${op.width}x${op.height}`);
						break;
					case 'trim':
						command = command.setStartTime(op.start).setDuration(op.duration);
						break;
					case 'compress':
						command = command.videoBitrate(op.bitrate);
						break;
				}
			}
			
			command.on('end', () => resolve(command.output))
				.on('error', reject)
				.save('pipe:1');
		});
	}

	async createSticker(buffer, options = {}) {
		const image = await this.processImage(buffer, [
			{ type: 'resize', width: 512, height: 512, fit: 'contain' }
		]);
		
		return sharp(image)
			.webp({ quality: 80 })
			.toBuffer();
	}

	async downloadMedia(url) {
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		return Buffer.from(response.data);
	}

	async convertFormat(buffer, fromFormat, toFormat) {
		if (this.supportedFormats.image.includes(toFormat)) {
			return await sharp(buffer).toFormat(toFormat).toBuffer();
		}
		
		return new Promise((resolve, reject) => {
			ffmpeg(buffer)
				.toFormat(toFormat)
				.on('end', () => resolve(command.output))
				.on('error', reject)
				.save('pipe:1');
		});
	}

	async extractFrames(videoBuffer, frameCount = 1) {
		return new Promise((resolve, reject) => {
			const frames = [];
			ffmpeg(videoBuffer)
				.on('filenames', filenames => frames.push(...filenames))
				.on('end', () => resolve(frames))
				.on('error', reject)
				.screenshots({
					count: frameCount,
					folder: './temp',
					filename: 'frame-%i.jpg'
				});
		});
	}
}

module.exports = MediaHandler;