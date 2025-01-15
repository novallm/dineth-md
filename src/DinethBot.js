const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const config = require('../config/config');
const CommandHandler = require('./handlers/CommandHandler');
const MessageHandler = require('./handlers/MessageHandler');
const AutoReplyHandler = require('./handlers/AutoReplyHandler');
const StatusHandler = require('./handlers/StatusHandler');

class DinethBot {
    constructor() {
        this.config = config;
        this.commands = new Map();
        this.startTime = Date.now();
        this.stats = {
            messagesProcessed: 0,
            commandsExecuted: 0
        };
        this.commandHandler = new CommandHandler(this);
        this.messageHandler = new MessageHandler(this);
        this.autoReplyHandler = new AutoReplyHandler(this);
        this.statusHandler = new StatusHandler(this);
    }

    async initialize() {
        // Load auth state
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        // Create WhatsApp socket connection
        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' })
        });

        // Load commands
        await this.loadCommands();

        // Bind event handlers
        this.setupEventListeners();

        // Handle connection events
        this.sock.ev.on('connection.update', this.handleConnectionUpdate.bind(this));
        this.sock.ev.on('creds.update', saveCreds);
    }

    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = 
                (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            
            if (shouldReconnect) {
                await this.initialize();
            }
        } else if (connection === 'open') {
            console.log('Connected successfully!');
        }
    }

    setupEventListeners() {
        // Handle incoming messages
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            const message = messages[0];
            if (!message.message) return;

            // Process command if it's a command
            if (message.message?.conversation?.startsWith(this.config.prefix)) {
                await this.commandHandler.handle(message);
            } else {
                // Handle auto-reply for non-command messages
                await this.autoReplyHandler.handleMessage(message);
            }

            this.stats.messagesProcessed++;
        });

        // Handle status updates
        this.sock.ev.on('status.update', async (status) => {
            await this.statusHandler.handleStatus(status);
        });
    }

    async sendMessage(jid, content, options = {}) {
        if (content.caption) {
            content.caption = this.messageHandler.addSignature(content.caption);
        }
        return await this.sock.sendMessage(jid, content, options);
    }

    async sendText(jid, text) {
        text = this.messageHandler.addSignature(text);
        return await this.sendMessage(jid, { text });
    }

    async sendImage(jid, image, caption = '') {
        return await this.sendMessage(jid, {
            image: image,
            caption: caption
        });
    }

    // ... other utility methods
}

module.exports = DinethBot; 
