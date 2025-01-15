const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

class AutoReplyHandler {
    constructor(bot) {
        this.bot = bot;
        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));
        
        // Personality traits for the bot
        this.personality = {
            name: "Dineth",
            traits: "friendly, helpful, and slightly flirty",
            mood: "cheerful",
            emojis: true
        };
    }

    async handleMessage(message) {
        const text = message.message?.conversation;
        if (!text) return;

        // Check if message should trigger auto-reply
        if (this.shouldAutoReply(text)) {
            const response = await this.generateResponse(text);
            await this.bot.sendText(message.key.remoteJid, response);
            
            // Random chance to send voice message
            if (Math.random() < 0.3) {
                await this.sendVoiceResponse(message.key.remoteJid, response);
            }
            
            // Add reaction
            await this.addReaction(message);
        }
    }

    shouldAutoReply(text) {
        // Add conditions for when to auto-reply
        const triggers = [
            'hi', 'hello', 'hey', 'dineth',
            'how are you', 'what\'s up',
            '❤️', '😊', '🥰'
        ];
        return triggers.some(t => text.toLowerCase().includes(t));
    }

    async generateResponse(text) {
        try {
            const prompt = `You are ${this.personality.name}, a ${this.personality.traits} AI assistant. 
                          Respond to: "${text}" in a ${this.personality.mood} way. Keep it brief and natural.`;

            const response = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 100,
                temperature: 0.8
            });

            let reply = response.data.choices[0].text.trim();
            if (this.personality.emojis) {
                reply = this.addEmojis(reply);
            }
            return reply;
        } catch (error) {
            console.error('AI response error:', error);
            return "Hey! 😊";
        }
    }

    addEmojis(text) {
        const emojis = ['😊', '💖', '✨', '🌟', '🥰', '💫', '💝'];
        const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
        return `${randomEmoji()} ${text} ${randomEmoji()}`;
    }

    async sendVoiceResponse(jid, text) {
        try {
            // Convert text to speech using a TTS API
            const response = await axios.get(
                `https://api.voicerss.org/?key=${process.env.VOICERSS_API_KEY}&hl=en-us&v=Alice&src=${encodeURIComponent(text)}`,
                { responseType: 'arraybuffer' }
            );

            await this.bot.sendMessage(jid, {
                audio: Buffer.from(response.data),
                ptt: true, // Push to talk (voice message)
                mimetype: 'audio/mp4'
            });
        } catch (error) {
            console.error('Voice message error:', error);
        }
    }

    async addReaction(message) {
        const reactions = ['❤️', '👍', '😊', '🌟', '💖', '✨'];
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        
        await this.bot.sock.sendMessage(message.key.remoteJid, {
            react: {
                text: reaction,
                key: message.key
            }
        });
    }
}

module.exports = AutoReplyHandler; 