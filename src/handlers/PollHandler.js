const { formatTimeLeft } = require('../utils/TimeUtils');

class PollHandler {
	constructor(bot) {
		this.bot = bot;
		this.activePolls = new Map();
		this.pollResults = new Map();
		this.pollSettings = new Map();
	}

	async createPoll(groupId, creator, options) {
		const pollId = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const poll = {
			id: pollId,
			groupId,
			creator,
			question: options.question,
			options: options.choices.map(choice => ({
				text: choice,
				votes: new Set()
			})),
			settings: {
				multipleChoice: options.multipleChoice || false,
				anonymous: options.anonymous || false,
				duration: options.duration || 24 * 60 * 60 * 1000, // 24 hours default
				requireParticipation: options.requireParticipation || false,
				showLiveResults: options.showLiveResults !== false,
				allowAddOptions: options.allowAddOptions || false
			},
			status: 'active',
			createdAt: Date.now(),
			expiresAt: Date.now() + (options.duration || 24 * 60 * 60 * 1000)
		};

		this.activePolls.set(pollId, poll);
		await this.sendPollMessage(poll);
		this.schedulePollEnd(pollId);

		return pollId;
	}

	async vote(pollId, userId, optionIndexes) {
		const poll = this.activePolls.get(pollId);
		if (!poll) throw new Error('Poll not found');
		if (poll.status !== 'active') throw new Error('Poll is not active');
		if (Date.now() > poll.expiresAt) throw new Error('Poll has expired');

		if (!poll.settings.multipleChoice && optionIndexes.length > 1) {
			throw new Error('Multiple choices not allowed');
		}

		// Remove previous votes if not multiple choice
		if (!poll.settings.multipleChoice) {
			poll.options.forEach(option => option.votes.delete(userId));
		}

		// Add new votes
		optionIndexes.forEach(index => {
			if (index >= 0 && index < poll.options.length) {
				poll.options[index].votes.add(userId);
			}
		});

		if (poll.settings.showLiveResults) {
			await this.updatePollMessage(poll);
		}

		return this.getPollResults(pollId);
	}

	async addOption(pollId, userId, newOption) {
		const poll = this.activePolls.get(pollId);
		if (!poll) throw new Error('Poll not found');
		if (!poll.settings.allowAddOptions) throw new Error('Adding options not allowed');
		if (userId !== poll.creator) throw new Error('Only poll creator can add options');

		poll.options.push({
			text: newOption,
			votes: new Set()
		});

		await this.updatePollMessage(poll);
		return poll.options.length - 1;
	}

	async endPoll(pollId, userId) {
		const poll = this.activePolls.get(pollId);
		if (!poll) throw new Error('Poll not found');
		if (userId !== poll.creator) throw new Error('Only poll creator can end poll');

		poll.status = 'ended';
		poll.endedAt = Date.now();

		const results = this.calculateResults(poll);
		this.pollResults.set(pollId, results);
		await this.sendPollResults(poll, results);

		return results;
	}

	calculateResults(poll) {
		const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.size, 0);
		const results = poll.options.map((option, index) => ({
			index,
			text: option.text,
			votes: option.votes.size,
			percentage: totalVotes ? (option.votes.size / totalVotes) * 100 : 0,
			voters: poll.settings.anonymous ? option.votes.size : Array.from(option.votes)
		}));

		return {
			totalVotes,
			options: results,
			winner: this.determineWinner(results),
			participation: this.calculateParticipation(poll)
		};
	}

	determineWinner(results) {
		const maxVotes = Math.max(...results.map(r => r.votes));
		return results
			.filter(r => r.votes === maxVotes)
			.map(r => ({
				text: r.text,
				votes: r.votes,
				percentage: r.percentage
			}));
	}

	calculateParticipation(poll) {
		const totalParticipants = new Set(
			poll.options.flatMap(option => Array.from(option.votes))
		).size;

		return {
			total: totalParticipants,
			percentage: totalParticipants / this.bot.getGroupMemberCount(poll.groupId) * 100
		};
	}

	async sendPollMessage(poll) {
		const message = this.formatPollMessage(poll);
		await this.bot.sock.sendMessage(poll.groupId, message);
	}

	async updatePollMessage(poll) {
		const message = this.formatPollMessage(poll);
		// Implementation depends on bot's message update capabilities
		await this.bot.sock.sendMessage(poll.groupId, message);
	}

	async sendPollResults(poll, results) {
		const message = this.formatPollResults(poll, results);
		await this.bot.sock.sendMessage(poll.groupId, message);
	}

	formatPollMessage(poll) {
		let message = `📊 *${poll.question}*\n\n`;
		
		poll.options.forEach((option, index) => {
			const percentage = poll.settings.showLiveResults 
				? ` - ${(option.votes.size / poll.options.reduce((sum, opt) => sum + opt.votes.size, 0) * 100).toFixed(1)}%`
				: '';
			message += `${index + 1}. ${option.text}${percentage}\n`;
		});

		message += `\nPoll ends in: ${formatTimeLeft(poll.expiresAt)}`;
		return { text: message };
	}

	formatPollResults(poll, results) {
		let message = `📊 *Poll Results: ${poll.question}*\n\n`;
		
		results.options.forEach(option => {
			message += `${option.text}: ${option.votes} votes (${option.percentage.toFixed(1)}%)\n`;
		});

		message += `\nTotal Votes: ${results.totalVotes}`;
		message += `\nParticipation: ${results.participation.percentage.toFixed(1)}%`;

		if (results.winner.length > 0) {
			message += `\n\nWinner${results.winner.length > 1 ? 's' : ''}: `;
			message += results.winner.map(w => w.text).join(', ');
		}

		return { text: message };
	}

	schedulePollEnd(pollId) {
		const poll = this.activePolls.get(pollId);
		const timeLeft = poll.expiresAt - Date.now();
		
		setTimeout(async () => {
			if (this.activePolls.has(pollId)) {
				await this.endPoll(pollId, poll.creator);
			}
		}, timeLeft);
	}

	getPollAnalytics(pollId) {
		const poll = this.activePolls.get(pollId) || {};
		const results = this.pollResults.get(pollId);
		
		if (!poll || !results) return null;

		return {
			duration: poll.endedAt ? poll.endedAt - poll.createdAt : null,
			participation: results.participation,
			votingPattern: this.analyzeVotingPattern(poll),
			optionDistribution: results.options.map(option => ({
				text: option.text,
				percentage: option.percentage
			})),
			engagementRate: results.participation.percentage
		};
	}

	analyzeVotingPattern(poll) {
		const voteTimestamps = Array.from(poll.options)
			.flatMap(option => Array.from(option.votes)
				.map(voter => ({
					voter,
					timestamp: Date.now() // In a real implementation, store vote timestamps
				})));

		return {
			peakVotingTime: this.findPeakVotingTime(voteTimestamps),
			votingSpeed: this.calculateVotingSpeed(voteTimestamps, poll)
		};
	}

	findPeakVotingTime(timestamps) {
		// Implementation to find the hour with most votes
		return new Date().getHours();
	}

	calculateVotingSpeed(timestamps, poll) {
		const duration = (poll.endedAt || Date.now()) - poll.createdAt;
		const votesPerMinute = timestamps.length / (duration / 60000);
		return votesPerMinute;
	}
}

module.exports = PollHandler;