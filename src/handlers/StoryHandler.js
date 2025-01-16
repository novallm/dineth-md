const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class StoryHandler {
	constructor(bot) {
		this.bot = bot;
		this.stories = new Map();
		this.viewTracking = new Map();
		this.mediaPath = path.join(process.cwd(), 'media', 'stories');
		this.initializeStorage();
	}

	async initializeStorage() {
		try {
			await fs.mkdir(this.mediaPath, { recursive: true });
		} catch (error) {
			console.error('Failed to create stories directory:', error);
		}
	}

	async createStory(sender, media, options = {}) {
		try {
			const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const processedMedia = await this.processMedia(media, options);
			
			const story = {
				id: storyId,
				sender,
				media: processedMedia,
				caption: options.caption || '',
				timestamp: Date.now(),
				expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
				views: new Set(),
				reactions: new Map(),
				settings: {
					privacy: options.privacy || 'all',
					allowReactions: options.allowReactions !== false,
					allowReplies: options.allowReplies !== false,
					highlightStory: options.highlightStory || false
				}
			};

			this.stories.set(storyId, story);
			await this.saveStoryMedia(storyId, processedMedia);
			return storyId;
		} catch (error) {
			throw new Error(`Failed to create story: ${error.message}`);
		}
	}

	async processMedia(media, options) {
		const mediaType = this.getMediaType(media);
		const processedPath = path.join(this.mediaPath, `${Date.now()}_processed`);

		switch (mediaType) {
			case 'image':
				return await this.processImage(media, processedPath, options);
			case 'video':
				return await this.processVideo(media, processedPath, options);
			default:
				throw new Error('Unsupported media type');
		}
	}

	async processImage(buffer, outputPath, options) {
		let processor = sharp(buffer)
			.resize(1080, 1920, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			});

		if (options.filter) {
			processor = this.applyImageFilter(processor, options.filter);
		}

		if (options.text) {
			processor = await this.addTextOverlay(processor, options.text);
		}

		await processor.toFile(`${outputPath}.jpg`);
		return `${outputPath}.jpg`;
	}

	async processVideo(buffer, outputPath, options) {
		await fs.writeFile(`${outputPath}_temp.mp4`, buffer);

		return new Promise((resolve, reject) => {
			let processor = ffmpeg(`${outputPath}_temp.mp4`)
				.size('1080x1920')
				.videoBitrate('1000k')
				.videoFilters([
					'scale=1080:1920:force_original_aspect_ratio=decrease',
					'pad=1080:1920:-1:-1:color=black'
				]);

			if (options.duration) {
				processor = processor.duration(options.duration);
			}

			processor
				.on('end', () => resolve(`${outputPath}.mp4`))
				.on('error', reject)
				.save(`${outputPath}.mp4`);
		});
	}

	applyImageFilter(processor, filter) {
		const filters = {
			grayscale: () => processor.grayscale(),
			sepia: () => processor.sepia(),
			blur: () => processor.blur(5),
			sharpen: () => processor.sharpen(),
			vintage: () => processor.tint({ r: 240, g: 220, b: 190 })
		};

		return filters[filter] ? filters[filter]() : processor;
	}

	async addTextOverlay(processor, text) {
		// Add text overlay implementation
		return processor;
	}

	async viewStory(storyId, viewer) {
		const story = this.stories.get(storyId);
		if (!story) throw new Error('Story not found');

		if (!story.views.has(viewer)) {
			story.views.add(viewer);
			this.trackView(storyId, viewer);
		}

		return {
			...story,
			viewCount: story.views.size,
			reactions: Array.from(story.reactions.entries())
		};
	}

	async reactToStory(storyId, user, reaction) {
		const story = this.stories.get(storyId);
		if (!story) throw new Error('Story not found');

		if (!story.settings.allowReactions) {
			throw new Error('Reactions are not allowed for this story');
		}

		story.reactions.set(user, {
			type: reaction,
			timestamp: Date.now()
		});

		return Array.from(story.reactions.entries());
	}

	async getStoriesFeed(user) {
		const now = Date.now();
		const validStories = Array.from(this.stories.values())
			.filter(story => story.expiresAt > now)
			.filter(story => this.canViewStory(story, user))
			.sort((a, b) => b.timestamp - a.timestamp);

		return validStories.map(story => ({
			id: story.id,
			sender: story.sender,
			timestamp: story.timestamp,
			viewCount: story.views.size,
			hasViewed: story.views.has(user),
			preview: story.media
		}));
	}

	canViewStory(story, user) {
		switch (story.settings.privacy) {
			case 'all':
				return true;
			case 'contacts':
				return this.bot.contacts.has(user);
			case 'close_friends':
				return this.bot.closeFriends.has(user);
			default:
				return false;
		}
	}

	async highlightStory(storyId) {
		const story = this.stories.get(storyId);
		if (!story) throw new Error('Story not found');

		story.settings.highlightStory = true;
		story.expiresAt = null; // Never expire highlighted stories
	}

	async deleteStory(storyId, user) {
		const story = this.stories.get(storyId);
		if (!story) throw new Error('Story not found');

		if (story.sender !== user) {
			throw new Error('Unauthorized to delete this story');
		}

		await fs.unlink(story.media);
		this.stories.delete(storyId);
	}

	trackView(storyId, viewer) {
		const viewData = {
			timestamp: Date.now(),
			viewer,
			storyId
		};

		if (!this.viewTracking.has(storyId)) {
			this.viewTracking.set(storyId, []);
		}

		this.viewTracking.get(storyId).push(viewData);
	}

	async getStoryStats(storyId) {
		const story = this.stories.get(storyId);
		if (!story) throw new Error('Story not found');

		const views = this.viewTracking.get(storyId) || [];
		
		return {
			viewCount: story.views.size,
			reactionCount: story.reactions.size,
			viewerStats: this.analyzeViewers(views),
			engagementRate: this.calculateEngagement(story),
			timeStats: this.analyzeViewTimes(views)
		};
	}

	analyzeViewers(views) {
		const uniqueViewers = new Set(views.map(v => v.viewer)).size;
		const viewsByTime = views.reduce((acc, view) => {
			const hour = new Date(view.timestamp).getHours();
			acc[hour] = (acc[hour] || 0) + 1;
			return acc;
		}, {});

		return { uniqueViewers, viewsByTime };
	}

	calculateEngagement(story) {
		const totalInteractions = story.views.size + story.reactions.size;
		return totalInteractions / this.bot.getTotalFollowers();
	}

	analyzeViewTimes(views) {
		const viewTimes = views.map(v => v.timestamp);
		return {
			firstView: Math.min(...viewTimes),
			lastView: Math.max(...viewTimes),
			peakViewingTime: this.findPeakViewingTime(viewTimes)
		};
	}

	findPeakViewingTime(viewTimes) {
		const hourCounts = viewTimes.reduce((acc, time) => {
			const hour = new Date(time).getHours();
			acc[hour] = (acc[hour] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(hourCounts)
			.sort(([, a], [, b]) => b - a)[0][0];
	}
}

module.exports = StoryHandler;