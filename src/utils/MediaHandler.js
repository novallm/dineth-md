const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class MediaHandler {
	constructor() {
		this.supportedTypes = {
			image: ['jpeg', 'png', 'gif', 'webp'],
			video: ['mp4', 'mov', 'avi'],
			audio: ['mp3', 'wav', 'ogg'],
			document: ['pdf', 'doc', 'docx', 'xls', 'xlsx']
		};
		this.mediaPath = path.join(process.cwd(), 'media');
		this.init();
	}

	async init() {
		try {
			await fs.mkdir(this.mediaPath, { recursive: true });
		} catch (error) {
			console.error('Failed to create media directory:', error);
		}
	}

	async processMedia(buffer, type, metadata = {}) {
		const fileHash = this.generateHash(buffer);
		const fileName = this.generateFileName(type, fileHash);
		const filePath = path.join(this.mediaPath, fileName);

		await fs.writeFile(filePath, buffer);

		return {
			path: filePath,
			hash: fileHash,
			type,
			metadata: {
				...metadata,
				size: buffer.length,
				timestamp: Date.now()
			}
		};
	}

	generateHash(buffer) {
		return crypto
			.createHash('sha256')
			.update(buffer)
			.digest('hex')
			.substring(0, 16);
	}

	generateFileName(type, hash) {
		const extension = this.getDefaultExtension(type);
		return `${type}_${hash}.${extension}`;
	}

	getDefaultExtension(type) {
		const extensions = {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3',
			document: 'pdf'
		};
		return extensions[type] || 'bin';
	}

	async validateMedia(buffer, type) {
		if (!this.supportedTypes[type]) {
			throw new Error(`Unsupported media type: ${type}`);
		}

		const maxSizes = {
			image: 16 * 1024 * 1024, // 16MB
			video: 64 * 1024 * 1024, // 64MB
			audio: 16 * 1024 * 1024, // 16MB
			document: 100 * 1024 * 1024 // 100MB
		};

		if (buffer.length > maxSizes[type]) {
			throw new Error(`File too large for type ${type}`);
		}

		return true;
	}

	async cleanupOldMedia(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
		const files = await fs.readdir(this.mediaPath);
		const now = Date.now();

		for (const file of files) {
			const filePath = path.join(this.mediaPath, file);
			const stats = await fs.stat(filePath);

			if (now - stats.mtimeMs > maxAge) {
				await fs.unlink(filePath);
			}
		}
	}

	async compressImage(buffer) {
		// Implement image compression logic
		return buffer;
	}

	async optimizeVideo(buffer) {
		// Implement video optimization logic
		return buffer;
	}

	async transcodeAudio(buffer, format) {
		// Implement audio transcoding logic
		return buffer;
	}

	async extractMetadata(buffer, type) {
		// Basic metadata extraction
		return {
			size: buffer.length,
			type,
			hash: this.generateHash(buffer),
			timestamp: Date.now()
		};
	}
}

module.exports = MediaHandler;