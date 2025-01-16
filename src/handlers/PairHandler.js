const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class PairHandler {
	constructor(bot) {
		this.bot = bot;
		this.pairingSessions = new Map();
		this.qrCodePath = path.join(process.cwd(), 'temp', 'qr');
		this.ensureQrDirectory();
	}

	ensureQrDirectory() {
		if (!fs.existsSync(this.qrCodePath)) {
			fs.mkdirSync(this.qrCodePath, { recursive: true });
		}
	}

	async handleQR(qr) {
		// Display QR in terminal
		qrcode.generate(qr, { small: true });
		
		// Save session info
		const sessionId = Date.now().toString();
		this.pairingSessions.set(sessionId, {
			qr,
			timestamp: new Date(),
			status: 'pending'
		});

		return sessionId;
	}

	async checkPairingStatus(sessionId) {
		return this.pairingSessions.get(sessionId) || { status: 'not_found' };
	}

	updatePairingStatus(sessionId, status) {
		if (this.pairingSessions.has(sessionId)) {
			const session = this.pairingSessions.get(sessionId);
			session.status = status;
			session.lastUpdate = new Date();
		}
	}

	clearOldSessions(maxAge = 3600000) { // 1 hour
		const now = Date.now();
		for (const [sessionId, session] of this.pairingSessions) {
			if (now - session.timestamp > maxAge) {
				this.pairingSessions.delete(sessionId);
			}
		}
	}
}

module.exports = PairHandler;