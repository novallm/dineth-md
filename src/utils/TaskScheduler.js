class TaskScheduler {
	constructor() {
		this.jobs = new Map();
		this.init();
	}

	init() {
		setInterval(() => this.checkJobs(), 1000);
	}

	addJob(job) {
		this.jobs.set(job.id, {
			...job,
			nextRun: new Date(job.time).getTime()
		});
		return job.id;
	}

	async checkJobs() {
		const now = Date.now();
		for (const [id, job] of this.jobs) {
			if (job.nextRun <= now) {
				await job.execute();
				if (job.recurrence) {
					job.nextRun = this.calculateNextRun(job);
				} else {
					this.jobs.delete(id);
				}
			}
		}
	}

	calculateNextRun(job) {
		const { recurrence } = job;
		const now = Date.now();
		
		switch(recurrence.type) {
			case 'daily':
				return now + 24 * 60 * 60 * 1000;
			case 'weekly':
				return now + 7 * 24 * 60 * 60 * 1000;
			case 'monthly':
				return now + 30 * 24 * 60 * 60 * 1000;
			default:
				return now + recurrence.interval;
		}
	}

	removeJob(id) {
		return this.jobs.delete(id);
	}

	getJobStatus(id) {
		const job = this.jobs.get(id);
		if (!job) return null;
		
		return {
			id: job.id,
			nextRun: new Date(job.nextRun),
			recurrence: job.recurrence
		};
	}
}

module.exports = TaskScheduler;