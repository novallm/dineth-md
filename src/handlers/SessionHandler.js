const crypto = require('crypto');
const { WebSocket } = require('ws');

class SessionHandler {
	constructor(bot) {
		this.bot = bot;
		this.sessions = new Map();
		this.websocket = null;
		this.serverUrl = 'wss://dinethmd.netlify.app/ws';
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
	}

	generateSessionId() {
		return crypto.randomBytes(16).toString('hex');
	}

	async createSession() {
		const sessionId = this.generateSessionId();
		const session = {
			id: sessionId,
			created: new Date(),
			status: 'active',
			connectionInfo: {
				device: this.bot.sock?.user?.name || 'Unknown',
				platform: 'WhatsApp',
				version: '1.0.0'
			}
		};
		this.sessions.set(sessionId, session);
		await this.connectToServer(sessionId);
		return session;
	}

	async connectToServer(sessionId) {
		try {
			this.websocket = new WebSocket(this.serverUrl);
			
			this.websocket.on('open', () => {
				this.websocket.send(JSON.stringify({
					type: 'auth',
					sessionId: sessionId,
					deviceInfo: this.sessions.get(sessionId).connectionInfo
				}));
				this.reconnectAttempts = 0;
			});

			this.websocket.on('message', async (data) => {
				try {
					const message = JSON.parse(data);
					await this.handleWebSocketMessage(message);
				} catch (error) {
					console.error('Error handling websocket message:', error);
				}
			});

			this.websocket.on('close', () => {
				if (this.reconnectAttempts < this.maxReconnectAttempts) {
					setTimeout(() => {
						this.reconnectAttempts++;
						this.connectToServer(sessionId);
					}, 5000 * Math.pow(2, this.reconnectAttempts));
				}
			});

			this.websocket.on('error', (error) => {
				console.error('WebSocket error:', error);
			});
		} catch (error) {
			console.error('Failed to connect to server:', error);
		}
	}

	async handleWebSocketMessage(message) {
		switch (message.type) {
			case 'command':
				await this.handleRemoteCommand(message);
				break;
			case 'status':
				await this.updateSessionStatus(message);
				break;
			case 'ping':
				this.sendPong();
				break;
		}
	}

	async handleRemoteCommand(message) {
		try {
			const { command, args, chat } = message.data;
			const result = await this.bot.commandHandler.handleRemoteCommand(command, args, chat);
			this.sendCommandResponse(message.id, result);
		} catch (error) {
			this.sendCommandResponse(message.id, { error: error.message });
		}
	}

	sendCommandResponse(messageId, result) {
		if (this.websocket?.readyState === WebSocket.OPEN) {
			this.websocket.send(JSON.stringify({
				type: 'commandResponse',
				id: messageId,
				result
			}));
		}
	}

	sendPong() {
		if (this.websocket?.readyState === WebSocket.OPEN) {
			this.websocket.send(JSON.stringify({ type: 'pong' }));
		}
	}

	updateSessionStatus(message) {
		const session = this.sessions.get(message.sessionId);
		if (session) {
			session.status = message.status;
			session.lastUpdate = new Date();
		}
	}

	getSessionInfo(sessionId) {
		return this.sessions.get(sessionId);
	}

	async closeSession(sessionId) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.status = 'closed';
			this.sessions.delete(sessionId);
			if (this.websocket?.readyState === WebSocket.OPEN) {
				this.websocket.close();
			}
			return true;
		}
		return false;
	}
}

module.exports = SessionHandler;