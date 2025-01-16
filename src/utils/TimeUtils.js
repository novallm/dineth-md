class TimeUtils {
	static formatTimeLeft(timestamp) {
		const timeLeft = timestamp - Date.now();
		
		if (timeLeft <= 0) return 'Expired';
		
		const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
		const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
		const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
		const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
		
		const parts = [];
		if (days > 0) parts.push(`${days}d`);
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		if (seconds > 0) parts.push(`${seconds}s`);
		
		return parts.join(' ');
	}

	static formatDuration(milliseconds) {
		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		return {
			days,
			hours: hours % 24,
			minutes: minutes % 60,
			seconds: seconds % 60,
			formatted: this.formatTimeLeft(Date.now() + milliseconds)
		};
	}

	static getTimeZone() {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	}

	static formatDateTime(date, format = 'full') {
		const options = {
			full: {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				timeZoneName: 'short'
			},
			short: {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			},
			time: {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}
		};

		return new Intl.DateTimeFormat('en-US', options[format]).format(date);
	}

	static isExpired(timestamp) {
		return Date.now() > timestamp;
	}

	static getRelativeTime(timestamp) {
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
		const diff = timestamp - Date.now();
		
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (Math.abs(days) > 0) return rtf.format(days, 'day');
		if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
		if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
		return rtf.format(seconds, 'second');
	}
}

module.exports = TimeUtils;