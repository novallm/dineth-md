const crypto = require('crypto');

class E2EEncryption {
	constructor() {
		this.keyPairs = new Map();
		this.sessionKeys = new Map();
		this.algorithm = 'aes-256-gcm';
	}

	async generateKeyPair(chatId) {
		const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem'
			}
		});

		this.keyPairs.set(chatId, { publicKey, privateKey });
		return publicKey;
	}

	async establishSession(chatId, peerPublicKey) {
		const sessionKey = crypto.randomBytes(32);
		const encryptedSessionKey = crypto.publicEncrypt(
			peerPublicKey,
			sessionKey
		);

		this.sessionKeys.set(chatId, sessionKey);
		return encryptedSessionKey;
	}

	async encryptMessage(message, chatId) {
		const sessionKey = this.sessionKeys.get(chatId);
		if (!sessionKey) {
			throw new Error('No session established for this chat');
		}

		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(this.algorithm, sessionKey, iv);
		
		let encrypted = cipher.update(message, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag();

		return {
			encrypted,
			iv: iv.toString('hex'),
			authTag: authTag.toString('hex')
		};
	}

	async decryptMessage(encryptedData, chatId) {
		const sessionKey = this.sessionKeys.get(chatId);
		if (!sessionKey) {
			throw new Error('No session established for this chat');
		}

		const decipher = crypto.createDecipheriv(
			this.algorithm,
			sessionKey,
			Buffer.from(encryptedData.iv, 'hex')
		);

		decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
		
		let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		
		return decrypted;
	}

	rotateSessionKey(chatId) {
		const newSessionKey = crypto.randomBytes(32);
		this.sessionKeys.set(chatId, newSessionKey);
		return newSessionKey;
	}

	verifyMessageIntegrity(message, signature, publicKey) {
		const verify = crypto.createVerify('SHA256');
		verify.update(message);
		return verify.verify(publicKey, signature, 'hex');
	}

	signMessage(message, chatId) {
		const { privateKey } = this.keyPairs.get(chatId);
		const sign = crypto.createSign('SHA256');
		sign.update(message);
		return sign.sign(privateKey, 'hex');
	}

	getPublicKey(chatId) {
		const keyPair = this.keyPairs.get(chatId);
		return keyPair ? keyPair.publicKey : null;
	}

	async encryptFile(fileBuffer, chatId) {
		const sessionKey = this.sessionKeys.get(chatId);
		if (!sessionKey) {
			throw new Error('No session established for this chat');
		}

		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(this.algorithm, sessionKey, iv);
		
		const encrypted = Buffer.concat([
			cipher.update(fileBuffer),
			cipher.final()
		]);

		return {
			encrypted: encrypted.toString('hex'),
			iv: iv.toString('hex'),
			authTag: cipher.getAuthTag().toString('hex')
		};
	}

	destroySession(chatId) {
		this.sessionKeys.delete(chatId);
		this.keyPairs.delete(chatId);
	}
}

module.exports = E2EEncryption;