const cron = require('node-cron');

class ReminderHandler {
	constructor(bot) {
		this.bot = bot;
		this.reminders = new Map();
		this.loadReminders();
	}

	async loadReminders() {
		// Load saved reminders from backup if available
		if (this.bot.messageBackups.has('reminders')) {
			this.reminders = new Map(this.bot.messageBackups.get('reminders'));
			this.scheduleLoadedReminders();
		}
	}

	scheduleLoadedReminders() {
		for (const [id, reminder] of this.reminders) {
			if (new Date(reminder.time) > new Date()) {
				this.scheduleReminder(id, reminder);
			}
		}
	}

	async addReminder(jid, message, time, recurring = false) {
		const id = Date.now().toString();
		const reminder = {
			jid,
			message,
			time,
			recurring,
			created: new Date().toISOString()
		};

		this.reminders.set(id, reminder);
		this.scheduleReminder(id, reminder);
		this.saveReminders();
		return id;
	}

	scheduleReminder(id, reminder) {
		const timeUntil = new Date(reminder.time) - new Date();
		if (timeUntil <= 0) return;

		setTimeout(async () => {
			await this.sendReminder(id, reminder);
			if (reminder.recurring) {
				// Reschedule for next day if recurring
				reminder.time = new Date(new Date(reminder.time).getTime() + 24 * 60 * 60 * 1000);
				this.scheduleReminder(id, reminder);
			} else {
				this.reminders.delete(id);
			}
			this.saveReminders();
		}, timeUntil);
	}

	async sendReminder(id, reminder) {
		try {
			await this.bot.sendMessage(reminder.jid, {
				text: `🔔 Reminder: ${reminder.message}\n\nSet on: ${reminder.created}`
			});
		} catch (error) {
			console.error('Failed to send reminder:', error);
		}
	}

	removeReminder(id) {
		const removed = this.reminders.delete(id);
		if (removed) {
			this.saveReminders();
		}
		return removed;
	}

	listReminders(jid) {
		return Array.from(this.reminders.entries())
			.filter(([_, reminder]) => reminder.jid === jid)
			.map(([id, reminder]) => ({
				id,
				message: reminder.message,
				time: reminder.time,
				recurring: reminder.recurring
			}));
	}

	saveReminders() {
		this.bot.messageBackups.set('reminders', Array.from(this.reminders.entries()));
	}
}

module.exports = ReminderHandler;