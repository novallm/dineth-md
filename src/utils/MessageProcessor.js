const crypto = require('crypto');

class MessageProcessor {
	constructor() {
		this.filters = new Map();
		this.spamThreshold = 0.7;
		this.messageHistory = new Map();
		this.rateLimits = new Map();
		this.languageDetector = new Set(['en', 'es', 'fr', 'de', 'it', 'pt']);
	}

	async processMessage(message) {
		const messageId = this.generateMessageId(message);
		const analysis = await this.analyzeMessage(message);

		if (analysis.isSpam) {
			return { action: 'block', reason: 'spam_detected' };
		}

		if (!this.checkRateLimit(message.sender)) {
			return { action: 'throttle', reason: 'rate_limit_exceeded' };
		}

		const enrichedMessage = await this.enrichMessage(message, analysis);
		this.updateHistory(messageId, enrichedMessage);

		return {
			messageId,
			processed: enrichedMessage,
			analysis,
			action: 'allow'
		};
	}

	async analyzeMessage(message) {
		const analysis = {
			sentiment: await this.analyzeSentiment(message.text),
			language: this.detectLanguage(message.text),
			toxicity: await this.checkToxicity(message.text),
			spam_score: this.calculateSpamScore(message),
			isSpam: false,
			keywords: this.extractKeywords(message.text)
		};

		analysis.isSpam = analysis.spam_score > this.spamThreshold;
		return analysis;
	}

	async analyzeSentiment(text) {
		// Basic sentiment analysis
		const positiveWords = new Set(['good', 'great', 'awesome', 'excellent']);
		const negativeWords = new Set(['bad', 'poor', 'terrible', 'awful']);
		
		const words = text.toLowerCase().split(/\s+/);
		let score = 0;
		
		words.forEach(word => {
			if (positiveWords.has(word)) score += 1;
			if (negativeWords.has(word)) score -= 1;
		});
		
		return {
			score: score / words.length,
			label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
		};
	}

	detectLanguage(text) {
		// Simple language detection based on common words
		const languagePatterns = {
			en: /\b(the|is|at|on|in|to)\b/i,
			es: /\b(el|la|en|de|por)\b/i,
			fr: /\b(le|la|les|en|dans)\b/i,
			de: /\b(der|die|das|in|zu)\b/i
		};

		for (const [lang, pattern] of Object.entries(languagePatterns)) {
			if (pattern.test(text)) return lang;
		}
		return 'unknown';
	}

	async checkToxicity(text) {
		const toxicPatterns = [
			/\b(hate|kill|death|destroy)\b/i,
			/\b(stupid|idiot|dumb)\b/i,
			/\b(curse|damn|hell)\b/i
		];

		let toxicityScore = 0;
		toxicPatterns.forEach(pattern => {
			if (pattern.test(text)) toxicityScore += 0.3;
		});

		return {
			score: Math.min(toxicityScore, 1),
			isToxic: toxicityScore > 0.6
		};
	}

	calculateSpamScore(message) {
		let score = 0;
		
		// Check for repeated characters
		if (/(.)\1{4,}/.test(message.text)) score += 0.3;
		
		// Check for excessive caps
		if (message.text.length > 10 && 
			message.text.replace(/[^A-Z]/g, '').length / message.text.length > 0.7) {
			score += 0.3;
		}
		
		// Check for URL density
		const urlCount = (message.text.match(/https?:\/\/\S+/g) || []).length;
		if (urlCount > 2) score += 0.4;
		
		return Math.min(score, 1);
	}

	extractKeywords(text) {
		const stopWords = new Set(['the', 'is', 'at', 'which', 'on']);
		const words = text.toLowerCase().split(/\W+/);
		
		return words
			.filter(word => word.length > 2 && !stopWords.has(word))
			.reduce((acc, word) => {
				acc[word] = (acc[word] || 0) + 1;
				return acc;
			}, {});
	}

	async enrichMessage(message, analysis) {
		return {
			...message,
			metadata: {
				processed_at: Date.now(),
				language: analysis.language,
				sentiment: analysis.sentiment,
				keywords: analysis.keywords,
				toxicity: analysis.toxicity
			},
			security: {
				spam_score: analysis.spam_score,
				is_safe: !analysis.toxicity.isToxic && !analysis.isSpam
			}
		};
	}

	generateMessageId(message) {
		return crypto
			.createHash('sha256')
			.update(`${message.sender}${message.text}${Date.now()}`)
			.digest('hex')
			.substring(0, 16);
	}

	checkRateLimit(sender) {
		const now = Date.now();
		const history = this.rateLimits.get(sender) || [];
		const windowSize = 60000; // 1 minute
		const limit = 30; // messages per minute
		
		// Clean old entries
		const recentHistory = history.filter(time => now - time < windowSize);
		
		if (recentHistory.length >= limit) {
			return false;
		}
		
		recentHistory.push(now);
		this.rateLimits.set(sender, recentHistory);
		return true;
	}

	updateHistory(messageId, message) {
		// Keep last 1000 messages
		if (this.messageHistory.size > 1000) {
			const oldestKey = this.messageHistory.keys().next().value;
			this.messageHistory.delete(oldestKey);
		}
		
		this.messageHistory.set(messageId, {
			...message,
			timestamp: Date.now()
		});
	}

	addCustomFilter(name, filterFn) {
		this.filters.set(name, filterFn);
	}

	removeFilter(name) {
		this.filters.delete(name);
	}
}

module.exports = MessageProcessor;