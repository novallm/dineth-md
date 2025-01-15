const Command = require('../../structures/Command');
const { Configuration, OpenAIApi } = require('openai');

class ChatGPTCommand extends Command {
    constructor() {
        super({
            name: 'ai',
            description: 'Chat with GPT AI',
            category: 'ai',
            usage: '!ai <question>',
            cooldown: 10
        });

        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a question!');
        }

        const question = args.join(' ');

        try {
            message.reply('🤔 Thinking...');

            const response = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: question,
                max_tokens: 2048,
                temperature: 0.7
            });

            const answer = response.data.choices[0].text.trim();
            
            await message.client.sendText(message.key.remoteJid, 
                `🤖 *AI Response:*\n\n${answer}`);

        } catch (error) {
            console.error('OpenAI error:', error);
            message.reply('❌ Failed to get AI response. Please try again later.');
        }
    }
}

module.exports = ChatGPTCommand; 