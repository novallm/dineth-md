const GameHandler = class {
	constructor(bot) {
		this.bot = bot;
		this.activeGames = new Map();
		this.gameScores = new Map();
		this.games = {
			quiz: this.createQuizGame.bind(this),
			wordchain: this.createWordChainGame.bind(this),
			riddle: this.createRiddleGame.bind(this),
			mathbattle: this.createMathBattleGame.bind(this),
			trivia: this.createTriviaGame.bind(this)
		};
	}

	async startGame(chatId, gameType, options = {}) {
		if (this.activeGames.has(chatId)) {
			throw new Error('A game is already active in this chat');
		}

		const gameCreator = this.games[gameType];
		if (!gameCreator) {
			throw new Error('Invalid game type');
		}

		const game = await gameCreator(chatId, options);
		this.activeGames.set(chatId, game);
		return game.start();
	}

	async handleGameMessage(message) {
		const chatId = message.key.remoteJid;
		const game = this.activeGames.get(chatId);
		if (!game) return false;

		return await game.handleMessage(message);
	}

	async createQuizGame(chatId, options) {
		return {
			type: 'quiz',
			players: new Set(),
			scores: new Map(),
			currentQuestion: null,
			questions: await this.fetchQuizQuestions(options.category),
			round: 0,
			maxRounds: options.rounds || 10,

			async start() {
				return this.nextQuestion();
			},

			async handleMessage(message) {
				if (!this.currentQuestion) return false;
				const answer = message.message.conversation.trim().toLowerCase();
				if (answer === this.currentQuestion.answer.toLowerCase()) {
					const player = message.key.participant || message.key.remoteJid;
					this.scores.set(player, (this.scores.get(player) || 0) + 1);
					await this.nextQuestion();
					return true;
				}
				return false;
			},

			async nextQuestion() {
				if (this.round >= this.maxRounds) {
					return this.endGame();
				}
				this.round++;
				this.currentQuestion = this.questions[this.round - 1];
				return `Question ${this.round}/${this.maxRounds}:\n${this.currentQuestion.question}`;
			},

			async endGame() {
				const scores = Array.from(this.scores.entries())
					.sort(([,a], [,b]) => b - a)
					.map(([player, score]) => `@${player.split('@')[0]}: ${score} points`)
					.join('\n');
				return `Game Over!\n\nFinal Scores:\n${scores}`;
			}
		};
	}

	async createWordChainGame(chatId) {
		return {
			type: 'wordchain',
			players: new Set(),
			lastWord: '',
			usedWords: new Set(),
			timeLimit: 30000,
			timer: null,

			async start() {
				this.startTimer();
				return 'Word Chain Game Started!\nRules: Reply with a word that starts with the last letter of the previous word';
			},

			async handleMessage(message) {
				const word = message.message.conversation.trim().toLowerCase();
				if (this.isValidWord(word)) {
					this.updateGame(word);
					return true;
				}
				return false;
			},

			isValidWord(word) {
				if (this.usedWords.has(word)) return false;
				if (this.lastWord && word[0] !== this.lastWord[this.lastWord.length - 1]) return false;
				return true;
			},

			startTimer() {
				this.timer = setTimeout(() => this.endGame(), this.timeLimit);
			},

			updateGame(word) {
				this.lastWord = word;
				this.usedWords.add(word);
				clearTimeout(this.timer);
				this.startTimer();
			}
		};
	}

	async fetchQuizQuestions(category) {
		// Implement quiz question fetching logic
		return [
			{ question: "What is the capital of France?", answer: "Paris" },
			{ question: "Which planet is known as the Red Planet?", answer: "Mars" }
			// Add more questions
		];
	}

	updateGameScore(chatId, playerId, points) {
		const playerScores = this.gameScores.get(chatId) || new Map();
		playerScores.set(playerId, (playerScores.get(playerId) || 0) + points);
		this.gameScores.set(chatId, playerScores);
	}

	getGameLeaderboard(chatId) {
		const scores = this.gameScores.get(chatId);
		if (!scores) return 'No scores available';

		return Array.from(scores.entries())
			.sort(([,a], [,b]) => b - a)
			.map(([player, score], index) => 
				`${index + 1}. @${player.split('@')[0]}: ${score} points`)
			.join('\n');
	}
}

module.exports = GameHandler;