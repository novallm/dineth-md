const crypto = require('crypto');

class PaymentProcessor {
	constructor() {
		this.transactions = new Map();
		this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
		this.securityKey = crypto.randomBytes(32).toString('hex');
	}

	async process(payment) {
		this.validatePayment(payment);
		const transactionId = this.generateTransactionId();
		
		try {
			const encryptedPayment = this.encryptPaymentData(payment);
			const transaction = {
				id: transactionId,
				data: encryptedPayment,
				status: 'pending',
				timestamp: Date.now(),
				receipt: null
			};

			await this.processTransaction(transaction);
			return this.generateReceipt(transaction);
		} catch (error) {
			throw new Error(`Payment processing failed: ${error.message}`);
		}
	}

	validatePayment(payment) {
		const { amount, currency, recipient } = payment;
		
		if (!amount || amount <= 0) {
			throw new Error('Invalid payment amount');
		}
		
		if (!this.supportedCurrencies.includes(currency)) {
			throw new Error('Unsupported currency');
		}
		
		if (!recipient) {
			throw new Error('Invalid recipient');
		}
	}

	generateTransactionId() {
		return `txn_${crypto.randomBytes(16).toString('hex')}`;
	}

	encryptPaymentData(payment) {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.securityKey, 'hex'), iv);
		
		let encrypted = cipher.update(JSON.stringify(payment), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		
		return {
			encrypted,
			iv: iv.toString('hex'),
			tag: cipher.getAuthTag().toString('hex')
		};
	}

	async processTransaction(transaction) {
		// Simulate payment processing
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		transaction.status = 'completed';
		transaction.receipt = this.generateReceiptNumber();
		
		this.transactions.set(transaction.id, transaction);
		return transaction;
	}

	generateReceipt(transaction) {
		return {
			transactionId: transaction.id,
			status: transaction.status,
			receipt: transaction.receipt,
			timestamp: new Date(transaction.timestamp).toISOString()
		};
	}

	generateReceiptNumber() {
		return `RCPT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
	}

	getTransaction(transactionId) {
		return this.transactions.get(transactionId);
	}

	async refund(transactionId) {
		const transaction = this.getTransaction(transactionId);
		if (!transaction) {
			throw new Error('Transaction not found');
		}
		
		transaction.status = 'refunded';
		this.transactions.set(transactionId, transaction);
		
		return {
			status: 'refunded',
			transactionId,
			timestamp: new Date().toISOString()
		};
	}
}

module.exports = PaymentProcessor;