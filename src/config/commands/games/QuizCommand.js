const Command = require('../../structures/Command');
const session = require('../../utils/SessionManager');

class QuizCommand extends Command {
    constructor() {
        super({
            name: 'quiz',
            aliases: ['trivia'],
            description: 'Play quiz games',
            category: 'games',
            usage: '.quiz <category>'
        });

        this.categories = {
            general: 'General Knowledge',
            science: 'Science',
            history: 'History',
            geography: 'Geography',
            anime: 'Anime & Manga',
            movies: 'Movies & TV'
        };

        this.questions = {
            general: [
                {
                    question: "What is the capital of France?",
                    options: ["London", "Berlin", "Paris", "Madrid"],
                    correct: 2
                },
                // Add more questions
            ]
        };
    }

    async execute(message, args) {
        const category = args[0]?.toLowerCase() || 'general';
        
        if (!this.categories[category]) {
            return message.reply(`Available Categories:
${Object.entries(this.categories).map(([id, name]) => `• ${id} - ${name}`).join('\n')}`);
        }

        const groupId = message.key.remoteJid;
        const groupSession = session.getGroup(groupId);

        if (groupSession.games.quiz?.active) {
            return message.reply('❌ A quiz game is already active in this group!');
        }

        // Start new quiz
        const question = this.getRandomQuestion(category);
        groupSession.games.quiz = {
            active: true,
            question: question,
            startTime: Date.now(),
            participants: {}
        };

        const quizText = `╭─❒ 『 QUIZ TIME 』 ❒
│
├─❒ 📚 *Category:* ${this.categories[category]}
│
├─❒ ❓ *Question:*
│ ${question.question}
│
├─❒ 🎯 *Options:*
${question.options.map((opt, i) => `│ ${i + 1}. ${opt}`).join('\n')}
│
├─❒ ⏱️ *Time:* 30 seconds
│
╰──────────────────❒

Reply with the number of your answer!`;

        await message.reply(quizText);

        // Set timeout to end quiz
        setTimeout(() => this.endQuiz(message, groupId), 30000);
    }

    async endQuiz(message, groupId) {
        const groupSession = session.getGroup(groupId);
        const quiz = groupSession.games.quiz;

        if (!quiz?.active) return;

        const correct = quiz.question.options[quiz.question.correct];
        let winners = Object.entries(quiz.participants)
            .filter(([_, answer]) => answer === quiz.question.correct)
            .map(([userId]) => userId);

        const resultText = `╭─❒ 『 QUIZ RESULTS 』 ❒
│
├─❒ ✅ *Correct Answer:* ${correct}
│
├─❒ 🏆 *Winners:*
${winners.length ? winners.map(id => `│ • @${id.split('@')[0]}`).join('\n') : '│ No winners this round!'}
│
╰──────────────────❒`;

        await message.client.sendMessage(groupId, {
            text: resultText,
            mentions: winners
        });

        // Award points to winners
        winners.forEach(userId => {
            const user = session.getUser(userId);
            user.xp += 100;
            user.money += 50;
        });

        // Clear quiz session
        delete groupSession.games.quiz;
    }

    getRandomQuestion(category) {
        const questions = this.questions[category];
        return questions[Math.floor(Math.random() * questions.length)];
    }
}

module.exports = QuizCommand; 