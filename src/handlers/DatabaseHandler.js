const mongoose = require('mongoose');
const redis = require('redis');
const sqlite3 = require('sqlite3').verbose();

class DatabaseHandler {
	constructor() {
		this.mongoClient = null;
		this.redisClient = null;
		this.sqliteDb = null;
		this.connected = false;
		this.cacheEnabled = true;
	}

	async initialize(config) {
		try {
			// MongoDB connection
			await mongoose.connect(config.mongoUri, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			this.mongoClient = mongoose.connection;

			// Redis connection
			this.redisClient = redis.createClient({
				url: config.redisUrl,
				password: config.redisPassword
			});
			await this.redisClient.connect();

			// SQLite connection
			this.sqliteDb = new sqlite3.Database(config.sqlitePath, (err) => {
				if (err) throw new Error(`SQLite connection failed: ${err.message}`);
			});

			this.connected = true;
			await this.initializeSchemas();
			await this.createTables();
		} catch (error) {
			throw new Error(`Database initialization failed: ${error.message}`);
		}
	}

	async initializeSchemas() {
		// MongoDB Schemas
		const userSchema = new mongoose.Schema({
			userId: String,
			name: String,
			settings: Object,
			stats: Object,
			createdAt: { type: Date, default: Date.now },
			updatedAt: { type: Date, default: Date.now }
		});

		const groupSchema = new mongoose.Schema({
			groupId: String,
			name: String,
			settings: Object,
			members: Array,
			stats: Object,
			createdAt: { type: Date, default: Date.now },
			updatedAt: { type: Date, default: Date.now }
		});

		const messageSchema = new mongoose.Schema({
			messageId: String,
			sender: String,
			content: String,
			type: String,
			metadata: Object,
			timestamp: { type: Date, default: Date.now }
		});

		this.models = {
			User: mongoose.model('User', userSchema),
			Group: mongoose.model('Group', groupSchema),
			Message: mongoose.model('Message', messageSchema)
		};
	}

	async createTables() {
		// SQLite Tables
		const queries = [
			`CREATE TABLE IF NOT EXISTS cache (
				key TEXT PRIMARY KEY,
				value TEXT,
				timestamp INTEGER
			)`,
			`CREATE TABLE IF NOT EXISTS analytics (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type TEXT,
				data TEXT,
				timestamp INTEGER
			)`,
			`CREATE TABLE IF NOT EXISTS logs (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				level TEXT,
				message TEXT,
				metadata TEXT,
				timestamp INTEGER
			)`
		];

		for (const query of queries) {
			await this.runQuery(query);
		}
	}

	async runQuery(query, params = []) {
		return new Promise((resolve, reject) => {
			this.sqliteDb.run(query, params, function(err) {
				if (err) reject(err);
				else resolve(this);
			});
		});
	}

	async saveUser(userData) {
		try {
			const user = new this.models.User(userData);
			await user.save();
			await this.cacheData(`user:${userData.userId}`, userData);
			return user;
		} catch (error) {
			throw new Error(`Failed to save user: ${error.message}`);
		}
	}

	async getUser(userId) {
		try {
			const cached = await this.getCachedData(`user:${userId}`);
			if (cached) return cached;

			const user = await this.models.User.findOne({ userId });
			if (user) {
				await this.cacheData(`user:${userId}`, user);
			}
			return user;
		} catch (error) {
			throw new Error(`Failed to get user: ${error.message}`);
		}
	}

	async saveGroup(groupData) {
		try {
			const group = new this.models.Group(groupData);
			await group.save();
			await this.cacheData(`group:${groupData.groupId}`, groupData);
			return group;
		} catch (error) {
			throw new Error(`Failed to save group: ${error.message}`);
		}
	}

	async saveMessage(messageData) {
		try {
			const message = new this.models.Message(messageData);
			await message.save();
			return message;
		} catch (error) {
			throw new Error(`Failed to save message: ${error.message}`);
		}
	}

	async cacheData(key, data, ttl = 3600) {
		if (!this.cacheEnabled) return;
		try {
			await this.redisClient.setEx(key, ttl, JSON.stringify(data));
		} catch (error) {
			console.error(`Cache set failed: ${error.message}`);
		}
	}

	async getCachedData(key) {
		if (!this.cacheEnabled) return null;
		try {
			const data = await this.redisClient.get(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error(`Cache get failed: ${error.message}`);
			return null;
		}
	}

	async saveAnalytics(type, data) {
		const query = `
			INSERT INTO analytics (type, data, timestamp)
			VALUES (?, ?, ?)
		`;
		await this.runQuery(query, [type, JSON.stringify(data), Date.now()]);
	}

	async getAnalytics(type, startTime, endTime) {
		return new Promise((resolve, reject) => {
			const query = `
				SELECT * FROM analytics
				WHERE type = ? AND timestamp BETWEEN ? AND ?
				ORDER BY timestamp DESC
			`;
			this.sqliteDb.all(query, [type, startTime, endTime], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	async logEvent(level, message, metadata = {}) {
		const query = `
			INSERT INTO logs (level, message, metadata, timestamp)
			VALUES (?, ?, ?, ?)
		`;
		await this.runQuery(query, [
			level,
			message,
			JSON.stringify(metadata),
			Date.now()
		]);
	}

	async cleanup() {
		// Cleanup old cache entries
		const query = `
			DELETE FROM cache
			WHERE timestamp < ?
		`;
		await this.runQuery(query, [Date.now() - 24 * 60 * 60 * 1000]);
	}

	async disconnect() {
		if (this.mongoClient) await this.mongoClient.close();
		if (this.redisClient) await this.redisClient.quit();
		if (this.sqliteDb) {
			await new Promise((resolve, reject) => {
				this.sqliteDb.close((err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		}
		this.connected = false;
	}
}

module.exports = DatabaseHandler;