const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const SessionHandler = require('./handlers/SessionHandler');
const SecurityHandler = require('./handlers/SecurityHandler');
const config = require('../config/config');
const CommandHandler = require('./handlers/CommandHandler');
const MessageHandler = require('./handlers/MessageHandler');
const AutoReplyHandler = require('./handlers/AutoReplyHandler');
const StatusHandler = require('./handlers/StatusHandler');
const ScheduleHandler = require('./handlers/ScheduleHandler');
const PairHandler = require('./handlers/PairHandler');
const BackupHandler = require('./handlers/BackupHandler');
const ReminderHandler = require('./handlers/ReminderHandler');
const AIHandler = require('./handlers/AIHandler');
const TalkDroveHandler = require('./handlers/TalkDroveHandler');
const fs = require('fs').promises;
const path = require('path');

class DinethBot {
    constructor() {
        this.config = config;
        this.commands = new Map();
        this.startTime = Date.now();
        this.securityHandler = new SecurityHandler(this);
        this.secureMode = true;
        this.stats = {
            messagesProcessed: 0,
            commandsExecuted: 0
        };
        this.commandHandler = new CommandHandler(this);
        this.messageHandler = new MessageHandler(this);
        this.autoReplyHandler = new AutoReplyHandler(this);
        this.statusHandler = new StatusHandler(this);
        this.scheduleHandler = new ScheduleHandler(this);
        this.userStats = new Map();
        this.pairHandler = new PairHandler(this);
        this.backupHandler = new BackupHandler(this);
        this.reminderHandler = new ReminderHandler(this);
        this.autoResponses = new Map();
        this.messageBackups = new Map();
        this.blockedUsers = new Set();
        this.messageQueue = [];
        this.sessionHandler = new SessionHandler(this);
        this.aiHandler = new AIHandler(this);
        this.talkDroveHandler = new TalkDroveHandler(this);
        this.metrics = {
            uptime: 0,
            memoryUsage: 0,
            activeChats: new Set(),
            commandSuccess: 0,
            commandFailed: 0
        };
    }

    async loadLatestBackup() {
        const latestBackup = await this.backupHandler.getLatestBackup();
        if (latestBackup) {
            return await this.backupHandler.loadBackup(latestBackup);
        }
        return false;
    }

    async initializeAI(config) {
        await this.aiHandler.initialize({
            openaiKey: config.openaiKey,
            huggingfaceKey: config.huggingfaceKey
        });
    }

    async initialize() {
        // Load auth state
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        // Load latest backup if available
        await this.loadLatestBackup();

        // Initialize AI if configured
        if (this.config.ai) {
            await this.initializeAI(this.config.ai);
        }
        
        // Initialize TalkDrove if configured
        if (this.config.talkdrove?.apiKey) {
            await this.talkDroveHandler.initializeHosting(this.config.talkdrove.apiKey);
        }
        
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

        // Start metrics collection
        await this.startMetricsCollection();
        
        // Create initial web session
        await this.sessionHandler.createSession();

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

    async processAdvancedMessage(message) {
        // Process AI commands
        if (message.message?.conversation?.startsWith('.ai')) {
            const result = await this.aiHandler.chatCompletion(message);
            await this.sendText(message.key.remoteJid, result);
            return;
        }

        // Check auto-responses
        const text = message.message?.conversation?.toLowerCase();
        if (text && this.autoResponses.has(text)) {
            await this.sendMessage(message.key.remoteJid, { 
                text: this.autoResponses.get(text) 
            });
        }

        // Process normal commands
        if (message.message?.conversation?.startsWith(this.config.prefix)) {
            await this.commandHandler.handle(message);
        } else {
            await this.autoReplyHandler.handleMessage(message);
        }
    }

    setupEventListeners() {
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            const message = messages[0];
            if (!message.message) return;

            // Track active chat
            this.metrics.activeChats.add(message.key.remoteJid);

            // Check blocked status
            if (this.isUserBlocked(message.key.remoteJid)) return;

            // Backup message
            await this.backupMessages(message);

            // Track user stats
            await this.trackUserStats(message);

            // Process message with advanced features
            await this.processAdvancedMessage(message);

            this.stats.messagesProcessed++;
        });

        // Process message queue every second
        setInterval(() => this.processMessageQueue(), 1000);

        // Handle status updates
        this.sock.ev.on('status.update', async (status) => {
            await this.statusHandler.handleStatus(status);
        });

        // Handle QR code updates
        this.sock.ev.on('qr', async (qr) => {
            await this.pairHandler.handleQR(qr);
        });
    }

    async trackUserStats(message) {
        const sender = message.key.remoteJid;
        if (!this.userStats.has(sender)) {
            this.userStats.set(sender, {
                messageCount: 0,
                commandCount: 0,
                lastActive: null
            });
        }
        
        const stats = this.userStats.get(sender);
        stats.messageCount++;
        stats.lastActive = new Date();
        
        if (message.message?.conversation?.startsWith(this.config.prefix)) {
            stats.commandCount++;
        }
    }

    getUserStats(jid) {
        return this.userStats.get(jid) || {
            messageCount: 0,
            commandCount: 0,
            lastActive: null
        };
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

    async broadcastMessage(numbers, content) {
        const results = [];
        for (const number of numbers) {
            try {
                const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
                await this.sendMessage(jid, content);
                results.push({ number, status: 'success' });
            } catch (error) {
                results.push({ number, status: 'failed', error: error.message });
            }
        }
        return results;
    }

    async broadcastToGroups(groups, content) {
        const results = [];
        for (const group of groups) {
            try {
                await this.sendMessage(group, content);
                results.push({ group, status: 'success' });
            } catch (error) {
                results.push({ group, status: 'failed', error: error.message });
            }
        }
        return results;
    }

    async backupMessages(message) {
        const chat = message.key.remoteJid;
        if (!this.messageBackups.has(chat)) {
            this.messageBackups.set(chat, []);
        }
        const backup = this.messageBackups.get(chat);
        backup.push({
            message: message.message,
            timestamp: new Date(),
            sender: message.key.participant || message.key.remoteJid
        });
        
        // Keep only last 100 messages
        if (backup.length > 100) backup.shift();
    }

    async addAutoResponse(trigger, response) {
        this.autoResponses.set(trigger.toLowerCase(), response);
    }

    async removeAutoResponse(trigger) {
        return this.autoResponses.delete(trigger.toLowerCase());
    }

    async blockUser(jid) {
        this.blockedUsers.add(jid);
    }

    async unblockUser(jid) {
        this.blockedUsers.delete(jid);
    }

    isUserBlocked(jid) {
        return this.blockedUsers.has(jid);
    }

    async queueMessage(jid, content, delay = 1000) {
        this.messageQueue.push({ jid, content, sendAt: Date.now() + delay });
    }

    async processMessageQueue() {
        const now = Date.now();
        while (this.messageQueue.length > 0 && this.messageQueue[0].sendAt <= now) {
            const { jid, content } = this.messageQueue.shift();
            await this.sendMessage(jid, content).catch(console.error);
        }
    }
async startMetricsCollection() {
    setInterval(() => {
        this.metrics.uptime = Date.now() - this.startTime;
        this.metrics.memoryUsage = process.memoryUsage().heapUsed;
    }, 1000);
}

async handleRemoteCommand(command, args, chat) {
    try {
        const result = await this.commandHandler.handle({
            key: { remoteJid: chat },
            message: { conversation: `${this.config.prefix}${command} ${args.join(' ')}` }
        });
        this.metrics.commandSuccess++;
        return { success: true, result };
    } catch (error) {
        this.metrics.commandFailed++;
        return { success: false, error: error.message };
    }
}

getMetrics() {
    return {
        ...this.metrics,
        activeChats: Array.from(this.metrics.activeChats),
        messageCount: this.stats.messagesProcessed,
        commandCount: this.stats.commandsExecuted
    };
}

async secureWebSession(sessionId) {
    const session = this.sessionHandler.getSessionInfo(sessionId);
    if (!session) return null;

    const token = this.securityHandler.generateToken(sessionId, session.connectionInfo);
    const encryptedSession = this.securityHandler.encrypt({
        ...session,
        token,
        timestamp: Date.now()
    });

    return {
        token,
        encryptedSession
    };
}

async validateWebSession(token, encryptedData) {
    const tokenData = this.securityHandler.verifyToken(token);
    if (!tokenData) return false;

    const sessionData = this.securityHandler.decrypt(encryptedData);
    if (!sessionData) return false;

    return sessionData.sessionId === tokenData.sessionId;
}

async handleWebSocketMessage(message) {
    if (!this.validateWebSession(message.token, message.data)) {
        console.error('Invalid session token');
        return;
    }

    const decryptedData = this.securityHandler.decrypt(message.data);
    if (!decryptedData) {
        console.error('Failed to decrypt message data');
        return;
    }

    switch (decryptedData.type) {
        case 'command':
            await this.handleRemoteCommand(decryptedData);
            break;
        case 'status':
            await this.updateSessionStatus(decryptedData);
            break;
        case 'ping':
            this.sendPong();
            break;
    }
}

sendCommandResponse(messageId, result) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
        const encryptedResponse = this.securityHandler.encrypt({
            type: 'commandResponse',
            id: messageId,
            result
        });
        
        this.websocket.send(JSON.stringify({
            type: 'secureResponse',
            data: encryptedResponse
        }));
    }
}
