require('dotenv').config();
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');

// Import Handlers
const AIHandler = require('./src/handlers/AIHandler');
const CommandHandler = require('./src/handlers/CommandHandler');
const DatabaseHandler = require('./src/handlers/DatabaseHandler');
const GroupHandler = require('./src/handlers/GroupHandler');
const MediaHandler = require('./src/handlers/MediaHandler');
const SecurityHandler = require('./src/handlers/SecurityHandler');
const StoryHandler = require('./src/handlers/StoryHandler');
const TalkDroveHandler = require('./src/handlers/TalkDroveHandler');
const VoiceHandler = require('./src/handlers/VoiceHandler');
const PollHandler = require('./src/handlers/PollHandler');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.handlers = {};
        this.initializeHandlers();
    }

    async initializeHandlers() {
        try {
            this.handlers.database = new DatabaseHandler();
            await this.handlers.database.initialize({
                mongoUri: process.env.MONGODB_URI,
                redisUrl: process.env.REDIS_URL,
                redisPassword: process.env.REDIS_PASSWORD,
                sqlitePath: path.join(__dirname, 'data', 'bot.db')
            });

            this.handlers.security = new SecurityHandler(this);
            this.handlers.ai = new AIHandler(this);
            this.handlers.command = new CommandHandler(this);
            this.handlers.group = new GroupHandler(this);
            this.handlers.media = new MediaHandler(this);
            this.handlers.story = new StoryHandler(this);
            this.handlers.talkdrove = new TalkDroveHandler(this);
            this.handlers.voice = new VoiceHandler(this);
            this.handlers.poll = new PollHandler(this);

            console.log('All handlers initialized successfully');
        } catch (error) {
            console.error('Failed to initialize handlers:', error);
            process.exit(1);
        }
    }

    async connectToWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            defaultQueryTimeoutMs: 60000
        });

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = 
                    (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                console.log('Connection closed due to:', lastDisconnect.error);
                
                if (shouldReconnect) {
                    await this.connectToWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('Connected to WhatsApp');
                await this.initializeBot();
            }
        });

        this.sock.ev.on('creds.update', saveCreds);
        this.setupMessageHandler();
    }

    async initializeBot() {
        try {
            await this.handlers.talkdrove.initializeHosting(process.env.TALKDROVE_API_KEY);
            console.log('Bot initialized successfully');
        } catch (error) {
            console.error('Failed to initialize bot:', error);
        }
    }

    setupMessageHandler() {
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const message of messages) {
                try {
                    if (message.key.fromMe) continue;

                    // Security check
                    const securityCheck = await this.handlers.security.validateMessage(message);
                    if (!securityCheck.valid) {
                        console.log(`Message blocked: ${securityCheck.violations.join(', ')}`);
                        continue;
                    }

                    // Process message based on type
                    if (message.message?.conversation || message.message?.extendedTextMessage?.text) {
                        await this.handleTextMessage(message);
                    } else if (message.message?.imageMessage) {
                        await this.handlers.media.processMediaMessage(message);
                    } else if (message.message?.audioMessage) {
                        await this.handlers.voice.processVoiceMessage(message);
                    }

                    // Log message for analytics
                    await this.handlers.database.saveMessage({
                        messageId: message.key.id,
                        sender: message.key.participant || message.key.remoteJid,
                        content: message.message?.conversation || '',
                        type: Object.keys(message.message || {})[0],
                        timestamp: message.messageTimestamp
                    });

                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        });
    }

    async handleTextMessage(message) {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Check if it's a command
        if (text.startsWith('!')) {
            const response = await this.handlers.command.handleCommand(message);
            if (response) {
                await this.sock.sendMessage(message.key.remoteJid, { text: response });
            }
            return;
        }

        // Process with AI if not a command
        const aiResponse = await this.handlers.ai.processMessage(text);
        if (aiResponse.text) {
            await this.sock.sendMessage(message.key.remoteJid, { text: aiResponse.text });
        }
    }

    async start() {
        try {
            await this.connectToWhatsApp();
        } catch (error) {
            console.error('Failed to start bot:', error);
            process.exit(1);
        }
    }
}

const bot = new WhatsAppBot();
bot.start();

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});