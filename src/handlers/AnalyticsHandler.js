const crypto = require('crypto');

class AnalyticsHandler {
	constructor(bot) {
		this.bot = bot;
		this.metrics = {
			commands: new Map(),
			users: new Map(),
			groups: new Map(),
			performance: new Map(),
			errors: new Map()
		};
		this.startTime = Date.now();
		this.initializeMetrics();
	}

	initializeMetrics() {
		// Performance metrics
		setInterval(() => this.trackPerformance(), 60000);
		
		// Error tracking
		process.on('uncaughtException', (error) => this.trackError('uncaught', error));
		process.on('unhandledRejection', (error) => this.trackError('unhandled', error));
	}

	trackCommand(command, user, success = true) {
		const cmdStats = this.metrics.commands.get(command) || {
			uses: 0,
			success: 0,
			failed: 0,
			users: new Set(),
			avgResponseTime: 0
		};

		cmdStats.uses++;
		success ? cmdStats.success++ : cmdStats.failed++;
		cmdStats.users.add(user);
		this.metrics.commands.set(command, cmdStats);
	}

	trackUserActivity(userId, activity) {
		const userStats = this.metrics.users.get(userId) || {
			messageCount: 0,
			commandCount: 0,
			activeGroups: new Set(),
			lastActive: null,
			interactions: []
		};

		userStats.messageCount++;
		if (activity.type === 'command') userStats.commandCount++;
		userStats.lastActive = new Date();
		userStats.interactions.push({
			type: activity.type,
			timestamp: new Date(),
			content: activity.content
		});

		// Keep only last 100 interactions
		if (userStats.interactions.length > 100) {
			userStats.interactions.shift();
		}

		this.metrics.users.set(userId, userStats);
	}

	trackGroupActivity(groupId, activity) {
		const groupStats = this.metrics.groups.get(groupId) || {
			messageCount: 0,
			memberCount: 0,
			activeMembers: new Set(),
			commandUsage: new Map(),
			lastActive: null
		};

		groupStats.messageCount++;
		if (activity.sender) groupStats.activeMembers.add(activity.sender);
		if (activity.type === 'command') {
			const cmdCount = groupStats.commandUsage.get(activity.command) || 0;
			groupStats.commandUsage.set(activity.command, cmdCount + 1);
		}
		groupStats.lastActive = new Date();

		this.metrics.groups.set(groupId, groupStats);
	}

	trackPerformance() {
		const now = Date.now();
		const performance = {
			uptime: now - this.startTime,
			memory: process.memoryUsage(),
			messageRate: this.calculateMessageRate(),
			responseTime: this.calculateAverageResponseTime(),
			activeConnections: this.bot.sock?.ws?.readyState === 1 ? 1 : 0
		};

		this.metrics.performance.set(now, performance);

		// Keep only last 24 hours of performance data
		const dayAgo = now - (24 * 60 * 60 * 1000);
		for (const [timestamp] of this.metrics.performance) {
			if (timestamp < dayAgo) this.metrics.performance.delete(timestamp);
		}
	}

	trackError(type, error) {
		const errorStats = this.metrics.errors.get(type) || {
			count: 0,
			occurrences: []
		};

		errorStats.count++;
		errorStats.occurrences.push({
			timestamp: new Date(),
			message: error.message,
			stack: error.stack
		});

		// Keep only last 50 errors
		if (errorStats.occurrences.length > 50) {
			errorStats.occurrences.shift();
		}

		this.metrics.errors.set(type, errorStats);
	}

	getAnalytics(type = 'all') {
		switch (type) {
			case 'commands':
				return this.getCommandAnalytics();
			case 'users':
				return this.getUserAnalytics();
			case 'groups':
				return this.getGroupAnalytics();
			case 'performance':
				return this.getPerformanceAnalytics();
			case 'errors':
				return this.getErrorAnalytics();
			default:
				return {
					commands: this.getCommandAnalytics(),
					users: this.getUserAnalytics(),
					groups: this.getGroupAnalytics(),
					performance: this.getPerformanceAnalytics(),
					errors: this.getErrorAnalytics()
				};
		}
	}

	calculateMessageRate() {
		const recentMessages = Array.from(this.metrics.users.values())
			.reduce((acc, user) => acc + user.messageCount, 0);
		return recentMessages / (Date.now() - this.startTime) * 1000 * 60; // Messages per minute
	}

	calculateAverageResponseTime() {
		const times = Array.from(this.metrics.commands.values())
			.map(cmd => cmd.avgResponseTime)
			.filter(time => time > 0);
		return times.length ? times.reduce((a, b) => a + b) / times.length : 0;
	}
}

module.exports = AnalyticsHandler;