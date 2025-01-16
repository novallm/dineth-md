const { Configuration, OpenAIApi } = require('openai');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const { NlpManager } = require('node-nlp');

class AIHandler {
	constructor() {
		this.openai = new OpenAIApi(new Configuration({
			apiKey: process.env.OPENAI_API_KEY
		}));
		this.nlpManager = new NlpManager({ languages: ['en'] });
		this.tokenizer = new natural.WordTokenizer();
		this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
		this.initNLP();
	}

	async initNLP() {
		await this.trainIntentRecognition();
		await this.loadCustomModel();
	}

	async processMessage(message, context = {}) {
		const analysis = await this.analyzeMessage(message);
		const response = await this.generateResponse(message, analysis, context);
		return {
			response,
			analysis,
			suggestions: await this.generateSuggestions(message, analysis)
		};
	}

	async analyzeMessage(message) {
		const [sentiment, intent, entities] = await Promise.all([
			this.analyzeSentiment(message),
			this.detectIntent(message),
			this.extractEntities(message)
		]);

		return {
			sentiment,
			intent,
			entities,
			language: await this.detectLanguage(message),
			toxicity: await this.checkToxicity(message),
			keywords: this.extractKeywords(message)
		};
	}

	async generateResponse(message, analysis, context) {
		const prompt = this.buildPrompt(message, analysis, context);
		const completion = await this.openai.createCompletion({
			model: "text-davinci-003",
			prompt,
			max_tokens: 150,
			temperature: 0.7,
			top_p: 1,
			frequency_penalty: 0.5,
			presence_penalty: 0.5
		});

		return {
			text: completion.data.choices[0].text.trim(),
			confidence: completion.data.choices[0].confidence || 0.8
		};
	}

	async analyzeSentiment(text) {
		const tokens = this.tokenizer.tokenize(text);
		const score = this.sentimentAnalyzer.getSentiment(tokens);
		
		return {
			score,
			label: this.getSentimentLabel(score),
			tokens
		};
	}

	async detectIntent(message) {
		const result = await this.nlpManager.process('en', message);
		return {
			intent: result.intent,
			score: result.score,
			entities: result.entities
		};
	}

	async extractEntities(text) {
		const entities = await this.nlpManager.extractEntities('en', text);
		return entities.map(entity => ({
			type: entity.type,
			value: entity.resolution.value,
			confidence: entity.accuracy
		}));
	}

	async generateSuggestions(message, analysis) {
		const context = {
			intent: analysis.intent,
			sentiment: analysis.sentiment,
			entities: analysis.entities
		};

		const completion = await this.openai.createCompletion({
			model: "text-davinci-003",
			prompt: this.buildSuggestionPrompt(message, context),
			max_tokens: 100,
			temperature: 0.6,
			n: 3
		});

		return completion.data.choices.map(choice => ({
			text: choice.text.trim(),
			confidence: choice.confidence || 0.7
		}));
	}

	async checkToxicity(text) {
		const model = await tf.loadLayersModel('file://models/toxicity/model.json');
		const encoded = await this.encodeText(text);
		const prediction = model.predict(encoded);
		
		return {
			toxic: prediction[0] > 0.5,
			score: prediction[0],
			categories: this.getToxicityCategories(prediction)
		};
	}

	async detectLanguage(text) {
		const result = await this.nlpManager.process(text);
		return {
			language: result.language,
			confidence: result.languageGuessed ? 0.6 : 0.9
		};
	}

	extractKeywords(text) {
		const tokens = this.tokenizer.tokenize(text);
		const tfidf = new natural.TfIdf();
		tfidf.addDocument(tokens);
		
		return tokens
			.map(token => ({
				word: token,
				score: tfidf.tfidf(token, 0)
			}))
			.sort((a, b) => b.score - a.score)
			.slice(0, 5);
	}

	async trainIntentRecognition() {
		// Add intents and training data
		this.nlpManager.addDocument('en', 'hello', 'greeting');
		this.nlpManager.addDocument('en', 'hi', 'greeting');
		this.nlpManager.addDocument('en', 'help', 'help');
		// Add more intents as needed
		await this.nlpManager.train();
	}

	buildPrompt(message, analysis, context) {
		return `
Context: ${JSON.stringify(context)}
User Intent: ${analysis.intent.intent}
Sentiment: ${analysis.sentiment.label}
Message: ${message}

Generate a helpful response that:
1. Addresses the user's intent
2. Matches their emotional tone
3. Is contextually relevant
4. Is concise and clear

Response:`;
	}

	buildSuggestionPrompt(message, context) {
		return `
Based on:
Message: ${message}
Intent: ${context.intent.intent}
Sentiment: ${context.sentiment.label}

Generate 3 relevant follow-up suggestions:`;
	}

	getSentimentLabel(score) {
		if (score > 0.3) return 'positive';
		if (score < -0.3) return 'negative';
		return 'neutral';
	}

	getToxicityCategories(predictions) {
		const categories = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'];
		return categories.reduce((acc, category, index) => {
			acc[category] = predictions[index];
			return acc;
		}, {});
	}

	async encodeText(text) {
		// Implement text encoding for the toxicity model
		const encoded = await tf.tensor2d([Array(100).fill(0)]);
		return encoded;
	}

	async loadCustomModel() {
		try {
			this.customModel = await tf.loadLayersModel('file://models/custom/model.json');
		} catch (error) {
			console.error('Failed to load custom model:', error);
		}
	}
}

module.exports = AIHandler;