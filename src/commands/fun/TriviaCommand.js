const axios = require('axios');

class TriviaCommand {
	constructor(bot) {
		this.bot = bot;
		this.command = 'trivia';
		this.aliases = ['quiz', 'question'];
		this.description = 'Play trivia games with different categories';
		this.activeGames = new Map();
		this.categories = {
			general: 9,
			books: 10,
			film: 11,
			music: 12,
			science: 17,
			computers: 18,
			anime: 31,
			cartoons: 32
		};
	}

	async execute(message, args) {
		const [action = 'start', category = 'general'] = args;

		switch (action) {
			case 'start':
				return await this.startTrivia(message, category);
			case 'categories':
				return this.listCategories(message);
			case 'score':
				return this.showScore(message);
			default:
				return this.checkAnswer(message, action);
		}
	}

	async startTrivia(message, category) {
		try {
			const categoryId = this.categories[category.toLowerCase()];
			if (!categoryId) {
				return 'Invalid category. Use !trivia categories to see available options.';
			}

			const response = await axios.get(`https://opentdb.com/api.php?amount=1&category=${categoryId}&type=multiple`);
			const question = response.data.results[0];

			const answers = [...question.incorrect_answers, question.correct_answer]
				.sort(() => Math.random() - 0.5);

			const gameData = {
				question: question.question,
				answers,
				correctAnswer: question.correct_answer,
				startTime: Date.now()
			};

			this.activeGames.set(message.key.remoteJid, gameData);

			let questionText = `🎯 *Trivia Question (${category})*\n\n`;
			questionText += `${this.decodeHtml(question.question)}\n\n`;
			answers.forEach((answer, index) => {
				questionText += `${index + 1}. ${this.decodeHtml(answer)}\n`;
			});
			questionText += '\nReply with the number of your answer!';

			await this.bot.sock.sendMessage(message.key.remoteJid, { text: questionText });
		} catch (error) {
			console.error('Trivia error:', error);
			return 'Failed to fetch trivia question. Please try again.';
		}
	}

	listCategories(message) {
		let text = '📚 *Available Trivia Categories*\n\n';
		Object.keys(this.categories).forEach(category => {
			text += `• ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
		});
		text += '\nUse !trivia start <category> to play!';
		return text;
	}

	async checkAnswer(message, answer) {
		const game = this.activeGames.get(message.key.remoteJid);
		if (!game) return 'No active trivia game. Start one with !trivia start';

		const answerIndex = parseInt(answer) - 1;
		if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= game.answers.length) {
			return 'Please provide a valid answer number.';
		}

		const userAnswer = game.answers[answerIndex];
		const timeTaken = (Date.now() - game.startTime) / 1000;
		const isCorrect = userAnswer === game.correctAnswer;

		this.updateScore(message.sender, isCorrect, timeTaken);
		this.activeGames.delete(message.key.remoteJid);

		return isCorrect
			? `🎉 Correct! You answered in ${timeTaken.toFixed(1)} seconds.`
			: `❌ Wrong! The correct answer was: ${this.decodeHtml(game.correctAnswer)}`;
	}

	updateScore(userId, correct, timeTaken) {
		const scores = this.bot.database.get('trivia_scores') || {};
		const userScore = scores[userId] || { correct: 0, total: 0, avgTime: 0 };

		userScore.total++;
		if (correct) {
			userScore.correct++;
			userScore.avgTime = (userScore.avgTime * (userScore.correct - 1) + timeTaken) / userScore.correct;
		}

		scores[userId] = userScore;
		this.bot.database.set('trivia_scores', scores);
	}

	showScore(message) {
		const scores = this.bot.database.get('trivia_scores') || {};
		const userScore = scores[message.sender];

		if (!userScore) {
			return "You haven't played any trivia games yet!";
		}

		return `📊 *Your Trivia Stats*\n\n` +
			`Correct Answers: ${userScore.correct}\n` +
			`Total Questions: ${userScore.total}\n` +
			`Success Rate: ${((userScore.correct / userScore.total) * 100).toFixed(1)}%\n` +
			`Average Time: ${userScore.avgTime.toFixed(1)}s`;
	}

	decodeHtml(html) {
		return html
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'");
	}
}

module.exports = TriviaCommand;