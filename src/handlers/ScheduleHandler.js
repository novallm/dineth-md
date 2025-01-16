const cron = require('node-cron');

class ScheduleHandler {
	constructor(bot) {
		this.bot = bot;
		this.scheduledTasks = new Map();
	}

	scheduleMessage(jid, content, cronExpression) {
		const task = cron.schedule(cronExpression, async () => {
			try {
				await this.bot.sendMessage(jid, content);
			} catch (error) {
				console.error('Failed to send scheduled message:', error);
			}
		});

		const taskId = Date.now().toString();
		this.scheduledTasks.set(taskId, task);
		return taskId;
	}

	cancelScheduledMessage(taskId) {
		const task = this.scheduledTasks.get(taskId);
		if (task) {
			task.stop();
			this.scheduledTasks.delete(taskId);
			return true;
		}
		return false;
	}

	getScheduledTasks() {
		return Array.from(this.scheduledTasks.keys());
	}
}

module.exports = ScheduleHandler;