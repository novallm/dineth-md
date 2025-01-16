const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const wav = require('wav');
const path = require('path');
const fs = require('fs').promises;

class VoiceHandler {
	constructor() {
		this.speechClient = new speech.SpeechClient();
		this.supportedLanguages = ['en-US', 'es-ES', 'hi-IN', 'ar-SA', 'zh-CN'];
		this.audioConfig = {
			sampleRateHertz: 16000,
			audioChannelCount: 1,
			encoding: 'LINEAR16'
		};
	}

	async processVoiceMessage(audioBuffer, options = {}) {
		try {
			const convertedAudio = await this.convertAudio(audioBuffer);
			const transcription = await this.transcribeAudio(convertedAudio, options.language);
			const analysis = await this.analyzeVoice(convertedAudio);
			
			return {
				text: transcription.text,
				confidence: transcription.confidence,
				language: transcription.language,
				analysis: {
					emotion: analysis.emotion,
					speed: analysis.speed,
					pitch: analysis.pitch
				}
			};
		} catch (error) {
			throw new Error(`Voice processing failed: ${error.message}`);
		}
	}

	async convertAudio(buffer) {
		const tempPath = path.join(process.cwd(), 'temp', `audio_${Date.now()}.wav`);
		await fs.mkdir(path.dirname(tempPath), { recursive: true });

		return new Promise((resolve, reject) => {
			ffmpeg()
				.input(buffer)
				.toFormat('wav')
				.audioFrequency(16000)
				.audioChannels(1)
				.on('end', () => resolve(tempPath))
				.on('error', reject)
				.save(tempPath);
		});
	}

	async transcribeAudio(audioPath, language = 'en-US') {
		const audioBytes = await fs.readFile(audioPath);
		const audio = {
			content: audioBytes.toString('base64')
		};

		const config = {
			...this.audioConfig,
			languageCode: this.validateLanguage(language),
			enableAutomaticPunctuation: true,
			enableWordTimeOffsets: true
		};

		const [response] = await this.speechClient.recognize({
			audio,
			config
		});

		const transcription = response.results
			.map(result => ({
				text: result.alternatives[0].transcript,
				confidence: result.alternatives[0].confidence,
				words: result.alternatives[0].words
			}))
			.reduce((acc, curr) => ({
				text: acc.text + ' ' + curr.text,
				confidence: (acc.confidence + curr.confidence) / 2,
				words: [...acc.words, ...curr.words]
			}));

		return {
			...transcription,
			language
		};
	}

	async analyzeVoice(audioPath) {
		const audioData = await this.readAudioFile(audioPath);
		return {
			emotion: await this.detectEmotion(audioData),
			speed: this.calculateSpeechRate(audioData),
			pitch: await this.analyzePitch(audioData)
		};
	}

	async readAudioFile(filePath) {
		return new Promise((resolve, reject) => {
			const reader = new wav.Reader();
			const chunks = [];

			reader.on('data', chunk => chunks.push(chunk));
			reader.on('end', () => resolve(Buffer.concat(chunks)));
			reader.on('error', reject);

			fs.createReadStream(filePath).pipe(reader);
		});
	}

	async detectEmotion(audioData) {
		// Implement emotion detection using audio characteristics
		const features = await this.extractAudioFeatures(audioData);
		return this.classifyEmotion(features);
	}

	calculateSpeechRate(audioData) {
		// Calculate words per minute based on audio length and content
		const durationInSeconds = audioData.length / (this.audioConfig.sampleRateHertz * 2);
		const estimatedWords = audioData.length / 16000; // Rough estimation
		return Math.round((estimatedWords / durationInSeconds) * 60);
	}

	async analyzePitch(audioData) {
		// Implement pitch analysis using FFT
		const pitchData = await this.extractPitchFeatures(audioData);
		return {
			average: this.calculateAveragePitch(pitchData),
			variation: this.calculatePitchVariation(pitchData)
		};
	}

	validateLanguage(language) {
		return this.supportedLanguages.includes(language) ? language : 'en-US';
	}

	async extractAudioFeatures(audioData) {
		// Extract MFCC features for emotion detection
		const frameSize = 512;
		const features = [];
		
		for (let i = 0; i < audioData.length; i += frameSize) {
			const frame = audioData.slice(i, i + frameSize);
			if (frame.length === frameSize) {
				features.push(this.computeMFCC(frame));
			}
		}
		
		return features;
	}

	computeMFCC(frame) {
		// Simplified MFCC computation
		return {
			energy: this.calculateEnergy(frame),
			zeroCrossings: this.calculateZeroCrossings(frame)
		};
	}

	calculateEnergy(frame) {
		return frame.reduce((sum, sample) => sum + (sample * sample), 0) / frame.length;
	}

	calculateZeroCrossings(frame) {
		let crossings = 0;
		for (let i = 1; i < frame.length; i++) {
			if ((frame[i] >= 0 && frame[i - 1] < 0) || 
				(frame[i] < 0 && frame[i - 1] >= 0)) {
				crossings++;
			}
		}
		return crossings;
	}

	classifyEmotion(features) {
		// Simple rule-based emotion classification
		const avgEnergy = features.reduce((sum, f) => sum + f.energy, 0) / features.length;
		const avgCrossings = features.reduce((sum, f) => sum + f.zeroCrossings, 0) / features.length;

		if (avgEnergy > 0.7) return 'excited';
		if (avgEnergy < 0.3) return 'calm';
		if (avgCrossings > 50) return 'angry';
		return 'neutral';
	}

	async extractPitchFeatures(audioData) {
		// Implement pitch extraction using autocorrelation
		const pitchData = [];
		const frameSize = 1024;
		
		for (let i = 0; i < audioData.length; i += frameSize) {
			const frame = audioData.slice(i, i + frameSize);
			if (frame.length === frameSize) {
				pitchData.push(this.estimatePitch(frame));
			}
		}
		
		return pitchData;
	}

	estimatePitch(frame) {
		// Simple autocorrelation-based pitch estimation
		const correlation = this.computeAutocorrelation(frame);
		const peak = this.findPeak(correlation);
		return this.audioConfig.sampleRateHertz / peak;
	}

	computeAutocorrelation(frame) {
		const correlation = new Float32Array(frame.length);
		for (let lag = 0; lag < frame.length; lag++) {
			let sum = 0;
			for (let i = 0; i < frame.length - lag; i++) {
				sum += frame[i] * frame[i + lag];
			}
			correlation[lag] = sum;
		}
		return correlation;
	}

	findPeak(correlation) {
		let peak = 0;
		let peakValue = 0;
		for (let i = 1; i < correlation.length; i++) {
			if (correlation[i] > peakValue) {
				peakValue = correlation[i];
				peak = i;
			}
		}
		return peak || 1;
	}

	calculateAveragePitch(pitchData) {
		return pitchData.reduce((sum, pitch) => sum + pitch, 0) / pitchData.length;
	}

	calculatePitchVariation(pitchData) {
		const avg = this.calculateAveragePitch(pitchData);
		const variance = pitchData.reduce((sum, pitch) => sum + Math.pow(pitch - avg, 2), 0) / pitchData.length;
		return Math.sqrt(variance);
	}
}

module.exports = VoiceHandler;