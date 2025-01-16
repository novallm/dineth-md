const Command = require('../../../structures/Command');

class AnalyticsCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'analytics',
			description: 'View bot analytics and metrics',
			usage: '.analytics <commands|users|groups|performance|errors>',
			aliases: ['stats', 'metrics'],
			category: 'admin'
		});
	}

	async execute(message, args) {
		const type = args[0]?.toLowerCase() || 'all';
		const analytics = this.bot.analyticsHandler.getAnalytics(type);

		switch (type) {
			case 'commands':
				return await this.showCommandStats(message, analytics);
			case 'users':
				return await this.showUserStats(message, analytics);
			case 'groups':
				return await this.showGroupStats(message, analytics);
			case 'performance':
				return await this.showPerformanceStats(message, analytics);
			case 'errors':
				return await this.showErrorStats(message, analytics);
			case 'trends':
				return await this.showTrendAnalysis(message, analytics);
			case 'predictions':
				return await this.showPredictions(message, analytics);
			case 'security':
				return await this.showSecurityMetrics(message, analytics);
			case 'network':
				return await this.showNetworkStats(message, analytics);
			case 'resources':
				return await this.showResourceUtilization(message, analytics);
			case 'interactions':
				return await this.showInteractionPatterns(message, analytics);
			case 'system':
				return await this.showSystemHealth(message, analytics);
			case 'usage':
				return await this.showUsageAnalytics(message, analytics);
			case 'optimization':
				return await this.showOptimizationMetrics(message, analytics);
			case 'behavior':
				return await this.showBehaviorAnalytics(message, analytics);
			case 'anomalies':
				return await this.showAnomalyDetection(message, analytics);
			case 'insights':
				return await this.showSystemInsights(message, analytics);
			case 'realtime':
				return await this.showRealtimeMetrics(message, analytics);
			case 'forecast':
				return await this.showSystemForecast(message, analytics);
			case 'capacity':
				return await this.showCapacityPlanning(message, analytics);
			default:
				return await this.showOverview(message, analytics);
		}
	}

	async showCommandStats(message, stats) {
		const topCommands = Array.from(stats.commands.entries())
			.sort(([,a], [,b]) => b.uses - a.uses)
			.slice(0, 10)
			.map(([cmd, data], i) => 
				`${i + 1}. ${cmd}: ${data.uses} uses (${data.success} success, ${data.failed} failed)`)
			.join('\n');

		const response = `📊 Command Statistics:\n\n${topCommands}\n\n` +
			`Average Response Time: ${stats.avgResponseTime.toFixed(2)}ms\n` +
			`Total Commands: ${Array.from(stats.commands.values()).reduce((acc, cmd) => acc + cmd.uses, 0)}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async showUserStats(message, stats) {
		const activeUsers = Array.from(stats.users.entries())
			.sort(([,a], [,b]) => b.messageCount - a.messageCount)
			.slice(0, 10)
			.map(([user, data], i) => 
				`${i + 1}. @${user.split('@')[0]}: ${data.messageCount} messages, ${data.commandCount} commands`)
			.join('\n');

		const response = `👥 User Statistics:\n\n${activeUsers}\n\n` +
			`Total Users: ${stats.users.size}\n` +
			`Active Today: ${Array.from(stats.users.values()).filter(u => 
				new Date() - new Date(u.lastActive) < 24 * 60 * 60 * 1000).length}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async showGroupStats(message, stats) {
		const activeGroups = Array.from(stats.groups.entries())
			.sort(([,a], [,b]) => b.messageCount - a.messageCount)
			.slice(0, 10)
			.map(([group, data], i) => 
				`${i + 1}. ${group}: ${data.messageCount} messages, ${data.activeMembers.size} active members`)
			.join('\n');

		const response = `👥 Group Statistics:\n\n${activeGroups}\n\n` +
			`Total Groups: ${stats.groups.size}\n` +
			`Total Messages: ${Array.from(stats.groups.values()).reduce((acc, g) => acc + g.messageCount, 0)}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async showPerformanceStats(message, stats) {
		const latest = Array.from(stats.performance.values()).pop();
		const uptime = Math.floor(latest.uptime / (1000 * 60 * 60)); // hours
		const memory = Math.floor(latest.memory.heapUsed / 1024 / 1024); // MB

		const response = `⚡ Performance Metrics:\n\n` +
			`Uptime: ${uptime} hours\n` +
			`Memory Usage: ${memory}MB\n` +
			`Message Rate: ${latest.messageRate.toFixed(2)}/min\n` +
			`Response Time: ${latest.responseTime.toFixed(2)}ms\n` +
			`Active Connections: ${latest.activeConnections}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async showErrorStats(message, stats) {
		const recentErrors = Array.from(stats.errors.entries())
			.map(([type, data]) => 
				`${type}: ${data.count} occurrences\nLast Error: ${data.occurrences[data.occurrences.length - 1].message}`)
			.join('\n\n');

		const response = `❌ Error Statistics:\n\n${recentErrors}\n\n` +
			`Total Errors: ${Array.from(stats.errors.values()).reduce((acc, e) => acc + e.count, 0)}`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}

	async showOverview(message, analytics) {
		const response = `📊 Bot Analytics Overview:\n\n` +
			`Commands:\n` +
			`- Total Commands: ${Array.from(analytics.commands.values()).reduce((acc, cmd) => acc + cmd.uses, 0)}\n` +
			`- Success Rate: ${(analytics.commands.success / analytics.commands.uses * 100).toFixed(2)}%\n\n` +
			`Users:\n` +
			`- Total Users: ${analytics.users.size}\n` +
			`- Active Today: ${Array.from(analytics.users.values()).filter(u => 
				new Date() - new Date(u.lastActive) < 24 * 60 * 60 * 1000).length}\n\n` +
			`Performance:\n` +
			`- Uptime: ${Math.floor(analytics.performance.uptime / (1000 * 60 * 60))} hours\n` +
			`- Memory: ${Math.floor(analytics.performance.memory.heapUsed / 1024 / 1024)}MB\n` +
			`- Message Rate: ${analytics.performance.messageRate.toFixed(2)}/min`;

		return await this.bot.sendText(message.key.remoteJid, response);
	}
}

async showTrendAnalysis(message, analytics) {
	const trends = this.bot.analyticsHandler.getTrends();
	const response = `📈 Trend Analysis:\n\n` +
		`Message Volume Trend:\n${this.generateTrendGraph(trends.messageVolume)}\n\n` +
		`User Growth Rate: ${trends.userGrowth.toFixed(2)}%\n` +
		`Command Usage Trend:\n${this.generateTrendGraph(trends.commandUsage)}\n` +
		`Peak Activity Hours: ${trends.peakHours.join(', ')}`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showPredictions(message, analytics) {
	const predictions = this.bot.analyticsHandler.getPredictions();
	const response = `🔮 Predictions:\n\n` +
		`Expected Load (Next Hour): ${predictions.load.nextHour}\n` +
		`User Activity Forecast: ${predictions.userActivity}\n` +
		`Resource Usage Prediction: ${predictions.resourceUsage}\n` +
		`Confidence Score: ${(predictions.confidence * 100).toFixed(2)}%`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showSecurityMetrics(message, analytics) {
	const security = this.bot.analyticsHandler.getSecurityMetrics();
	const response = `🔒 Security Metrics:\n\n` +
		`Rate Limit Breaches: ${security.rateLimitBreaches}\n` +
		`Failed Auth Attempts: ${security.failedAuth}\n` +
		`Suspicious Patterns: ${security.suspiciousPatterns.join(', ')}\n` +
		`Security Score: ${security.score}/100`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showNetworkStats(message, analytics) {
	const network = this.bot.analyticsHandler.getNetworkStats();
	const response = `🌐 Network Statistics:\n\n` +
		`Latency: ${network.latency}ms\n` +
		`Packet Loss: ${network.packetLoss}%\n` +
		`Bandwidth Usage: ${this.formatBytes(network.bandwidth)}/s\n` +
		`Connection Quality: ${network.quality}`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showResourceUtilization(message, analytics) {
	const resources = this.bot.analyticsHandler.getResourceUtilization();
	const response = `💻 Resource Utilization:\n\n` +
		`CPU Usage: ${resources.cpu}%\n` +
		`Memory Allocation:\n${this.generateMemoryChart(resources.memory)}\n` +
		`Disk I/O: ${resources.diskIO} ops/s\n` +
		`Thread Pool: ${resources.threadPool.active}/${resources.threadPool.total}`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showInteractionPatterns(message, analytics) {
	const patterns = this.bot.analyticsHandler.getInteractionPatterns();
	const response = `🔄 Interaction Patterns:\n\n` +
		`Most Active Times:\n${this.generateActivityHeatmap(patterns.activityHours)}\n\n` +
		`Command Chains:\n${this.formatCommandChains(patterns.commandChains)}\n` +
		`User Engagement Score: ${patterns.engagementScore}/100`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

generateTrendGraph(data) {
	const max = Math.max(...data);
	const normalized = data.map(v => Math.round((v / max) * 8));
	const bars = '▁▂▃▄▅▆▇█';
	return normalized.map(n => bars[n]).join('');
}

generateMemoryChart(memory) {
	const used = Math.round((memory.used / memory.total) * 10);
	return `[${'█'.repeat(used)}${'-'.repeat(10-used)}] ${((memory.used/memory.total)*100).toFixed(1)}%`;
}

generateActivityHeatmap(hours) {
	const max = Math.max(...Object.values(hours));
	return Object.entries(hours)
		.map(([hour, count]) => {
			const intensity = Math.round((count / max) * 4);
			return `${hour}:00 ${'■'.repeat(intensity)}${'□'.repeat(4-intensity)}`;
		})
		.join('\n');
}

formatCommandChains(chains) {
	return chains
		.slice(0, 3)
		.map(chain => chain.commands.join(' → '))
		.join('\n');
}

formatBytes(bytes) {
	const units = ['B', 'KB', 'MB', 'GB'];
	let value = bytes;
	let unit = 0;
	while (value > 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}
	return `${value.toFixed(1)}${units[unit]}`;
}

async showSystemHealth(message, analytics) {
    const health = this.bot.analyticsHandler.getSystemHealth();
    const response = `🏥 System Health:\n\n` +
        `Overall Status: ${health.status}\n` +
        `Health Score: ${health.score}/100\n\n` +
        `Memory Health:\n${this.generateHealthIndicator(health.memory.score)}\n` +
        `CPU Health:\n${this.generateHealthIndicator(health.cpu.score)}\n` +
        `Network Health:\n${this.generateHealthIndicator(health.network.score)}\n\n` +
        `Active Issues: ${health.issues.length}\n${this.formatHealthIssues(health.issues)}`;
    
    return await this.bot.sendText(message.key.remoteJid, response);
}

async showUsageAnalytics(message, analytics) {
    const usage = this.bot.analyticsHandler.getUsageAnalytics();
    const response = `📊 Usage Analytics:\n\n` +
        `Feature Usage:\n${this.generateFeatureUsageChart(usage.features)}\n\n` +
        `User Sessions:\n${this.generateSessionGraph(usage.sessions)}\n\n` +
        `Popular Commands:\n${this.generatePopularityChart(usage.commands)}\n` +
        `Retention Rate: ${usage.retention.toFixed(2)}%`;
    
    return await this.bot.sendText(message.key.remoteJid, response);
}

async showOptimizationMetrics(message, analytics) {
    const optimization = this.bot.analyticsHandler.getOptimizationMetrics();
    const response = `⚡ Optimization Metrics:\n\n` +
        `Response Time Distribution:\n${this.generateResponseTimeGraph(optimization.responseTimes)}\n\n` +
        `Cache Hit Rate: ${optimization.cacheHitRate.toFixed(2)}%\n` +
        `Resource Efficiency:\n${this.generateEfficiencyChart(optimization.efficiency)}\n` +
        `Optimization Score: ${optimization.score}/100`;
    
    return await this.bot.sendText(message.key.remoteJid, response);
}

generateHealthIndicator(score) {
    const blocks = '█▉▊▋▌▍▎▏';
    const level = Math.floor((score / 100) * (blocks.length - 1));
    const bar = blocks[level];
    return `[${bar.repeat(10)}] ${score}%`;
}

formatHealthIssues(issues) {
    return issues
        .map(issue => `• ${issue.severity}: ${issue.message}`)
        .join('\n');
}

generateFeatureUsageChart(features) {
    return Object.entries(features)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([feature, count]) => {
            const bars = '▏▎▍▌▋▊▉█';
            const level = Math.floor((count / features[Object.keys(features)[0]]) * 7);
            return `${feature}: ${bars[level].repeat(8)} ${count}`;
        })
        .join('\n');
}

generateSessionGraph(sessions) {
    const maxSessions = Math.max(...Object.values(sessions));
    return Object.entries(sessions)
        .map(([hour, count]) => {
            const height = Math.round((count / maxSessions) * 5);
            return `${hour}h ${this.getBarStack(height)}`;
        })
        .join('\n');
}

getBarStack(height) {
    const chars = ' ▁▂▃▄▅▆▇█';
    return chars[height];
}

generatePopularityChart(commands) {
    return Object.entries(commands)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cmd, uses]) => {
            const percentage = (uses / Object.values(commands).reduce((a, b) => a + b)) * 100;
            return `${cmd}: ${'■'.repeat(Math.round(percentage/5))} ${percentage.toFixed(1)}%`;
        })
        .join('\n');
}

generateResponseTimeGraph(times) {
    const buckets = Array(10).fill(0);
    times.forEach(time => {
        const bucket = Math.min(9, Math.floor(time / 100));
        buckets[bucket]++;
    });
    
    const max = Math.max(...buckets);
    return buckets
        .map((count, i) => {
            const height = Math.round((count / max) * 8);
            return `${i*100}ms ${this.getBarStack(height)}`;
        })
        .join('\n');
}

generateEfficiencyChart(efficiency) {
    return Object.entries(efficiency)
        .map(([metric, value]) => {
            const percentage = value * 100;
            return `${metric}: ${this.generateProgressBar(percentage)}`;
        })
        .join('\n');
}

generateProgressBar(percentage) {
	const width = 10;
	const filled = Math.round((percentage / 100) * width);
	return `[${'█'.repeat(filled)}${'-'.repeat(width-filled)}] ${percentage.toFixed(1)}%`;
}

async showBehaviorAnalytics(message, analytics) {
	const behavior = this.bot.analyticsHandler.getBehaviorAnalytics();
	const response = `🔍 Behavior Analytics:\n\n` +
		`User Patterns:\n${this.generatePatternChart(behavior.patterns)}\n\n` +
		`Command Sequences:\n${this.generateSequenceFlow(behavior.sequences)}\n` +
		`Interaction Flow:\n${this.generateInteractionFlow(behavior.interactions)}\n` +
		`Behavior Score: ${behavior.score}/100`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showAnomalyDetection(message, analytics) {
	const anomalies = this.bot.analyticsHandler.getAnomalyDetection();
	const response = `⚠️ Anomaly Detection:\n\n` +
		`Recent Anomalies:\n${this.formatAnomalies(anomalies.recent)}\n\n` +
		`Pattern Deviations:\n${this.generateDeviationChart(anomalies.deviations)}\n` +
		`Risk Assessment:\n${this.generateRiskMatrix(anomalies.risks)}`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

async showSystemInsights(message, analytics) {
	const insights = this.bot.analyticsHandler.getSystemInsights();
	const response = `💡 System Insights:\n\n` +
		`Key Findings:\n${this.formatInsights(insights.findings)}\n\n` +
		`Performance Trends:\n${this.generateTrendInsights(insights.trends)}\n` +
		`Recommendations:\n${this.formatRecommendations(insights.recommendations)}`;
	
	return await this.bot.sendText(message.key.remoteJid, response);
}

generatePatternChart(patterns) {
	return patterns
		.map(pattern => {
			const frequency = pattern.frequency * 10;
			return `${pattern.name}:\n${'◆'.repeat(Math.round(frequency))} ${(frequency*10).toFixed(1)}%`;
		})
		.join('\n');
}

generateSequenceFlow(sequences) {
	return sequences
		.slice(0, 3)
		.map(seq => {
			const steps = seq.steps.join(' ➔ ');
			return `${steps} (${seq.frequency}%)`;
		})
		.join('\n');
}

generateInteractionFlow(interactions) {
	const maxWidth = 15;
	return interactions
		.map(int => {
			const width = Math.round((int.value / 100) * maxWidth);
			return `${int.type}: ${'▶'.repeat(width)} ${int.value}%`;
		})
		.join('\n');
}

formatAnomalies(anomalies) {
	return anomalies
		.map(anomaly => {
			const severity = '⚠'.repeat(anomaly.severity);
			return `${severity} ${anomaly.type}: ${anomaly.description}`;
		})
		.join('\n');
}

generateDeviationChart(deviations) {
	return deviations
		.map(dev => {
			const variance = Math.abs(dev.variance);
			const indicator = dev.variance > 0 ? '↗' : '↘';
			return `${dev.metric}: ${indicator.repeat(Math.min(3, Math.ceil(variance)))} ${variance.toFixed(1)}%`;
		})
		.join('\n');
}

generateRiskMatrix(risks) {
	return risks
		.map(risk => {
			const level = Math.round(risk.level * 4);
			const indicator = '█'.repeat(level) + '░'.repeat(4 - level);
			return `${risk.type}: [${indicator}] ${risk.probability}%`;
		})
		.join('\n');
}

formatInsights(findings) {
	return findings
		.map(finding => `• ${finding.priority}! ${finding.description}`)
		.join('\n');
}

generateTrendInsights(trends) {
	return trends
		.map(trend => {
			const direction = trend.direction > 0 ? '↗' : trend.direction < 0 ? '↘' : '→';
			return `${trend.metric}: ${direction} ${trend.change}%`;
		})
		.join('\n');
}

formatRecommendations(recommendations) {
	return recommendations
		.map((rec, i) => `${i + 1}. ${rec.action} (Impact: ${rec.impact}/10)`)
		.join('\n');
}

async showRealtimeMetrics(message, analytics) {
    const realtime = this.bot.analyticsHandler.getRealtimeMetrics();
    const response = `⚡ Real-time Monitoring:\n\n` +
        `Current Load:\n${this.generateLoadGauge(realtime.load)}\n\n` +
        `Active Operations:\n${this.generateOperationsFlow(realtime.operations)}\n` +
        `System Status:\n${this.generateStatusIndicators(realtime.status)}\n` +
        `Live Metrics:\n${this.formatLiveMetrics(realtime.metrics)}`;
    
    return await this.bot.sendText(message.key.remoteJid, response);
}

async showSystemForecast(message, analytics) {
    const forecast = this.bot.analyticsHandler.getSystemForecast();
    const response = `🔮 System Forecast:\n\n` +
        `Load Prediction:\n${this.generateLoadForecast(forecast.load)}\n\n` +
        `Resource Trends:\n${this.generateResourceTrends(forecast.resources)}\n` +
        `Growth Projections:\n${this.generateGrowthChart(forecast.growth)}\n` +
        `Capacity Timeline:\n${this.generateCapacityTimeline(forecast.capacity)}`;
    
    return await this.bot.sendText(message.key.remoteJid, response);
}

async showCapacityPlanning(message, analytics) {
    const capacity = this.bot.analyticsHandler.getCapacityPlanning();
    const response = `📈 Capacity Planning:\n\n` +
        `Resource Allocation:\n${this.generateAllocationChart(capacity.allocation)}\n\n` +
        `Scaling Thresholds:\n${this.generateThresholdIndicators(capacity.thresholds)}\n` +
        `Optimization Opportunities:\n${this.formatOptimizations(capacity.optimizations)}\n` +
        `Growth Strategy:\n${this.formatGrowthStrategy(capacity.strategy)}`;
    
    return await this.bot.sendText(message.key.remoteJid, response);
}

generateLoadGauge(load) {
    const percentage = load.current;
    const segments = 20;
    const filled = Math.round((percentage / 100) * segments);
    const gauge = [
        '▱'.repeat(segments),
        '▰'.repeat(filled) + '▱'.repeat(segments - filled),
        `${percentage.toFixed(1)}%`
    ].join('\n');
    return gauge;
}

generateOperationsFlow(operations) {
    return operations
        .map(op => {
            const progress = Math.round(op.progress * 10);
            return `${op.type}: [${'▰'.repeat(progress)}${'▱'.repeat(10-progress)}] ${op.count}`;
        })
        .join('\n');
}

generateStatusIndicators(status) {
    const indicators = {
        healthy: '🟢',
        warning: '🟡',
        critical: '🔴'
    };
    return Object.entries(status)
        .map(([system, state]) => `${indicators[state]} ${system}`)
        .join('\n');
}

formatLiveMetrics(metrics) {
    return metrics
        .map(metric => {
            const trend = metric.trend > 0 ? '↗' : metric.trend < 0 ? '↘' : '→';
            return `${metric.name}: ${metric.value}${metric.unit} ${trend}`;
        })
        .join('\n');
}

generateLoadForecast(load) {
    const intervals = Object.entries(load)
        .map(([time, value]) => {
            const level = Math.round((value / 100) * 8);
            return `${time}: ${'█'.repeat(level)}${'░'.repeat(8-level)} ${value}%`;
        })
        .join('\n');
    return intervals;
}

generateResourceTrends(resources) {
    return resources
        .map(resource => {
            const trend = '→'.repeat(Math.min(3, Math.abs(resource.trend)));
            const direction = resource.trend > 0 ? '↗' : resource.trend < 0 ? '↘' : '→';
            return `${resource.name}: ${direction}${trend} ${resource.projection}%`;
        })
        .join('\n');
}

generateGrowthChart(growth) {
    return growth
        .map(point => {
            const marker = point.milestone ? '◆' : '•';
            return `${point.period}: ${marker.repeat(Math.round(point.rate))} ${point.rate}%`;
        })
        .join('\n');
}

generateCapacityTimeline(capacity) {
    return capacity
        .map(event => {
            const urgency = '!'.repeat(event.priority);
            return `${event.time}: ${event.action} ${urgency}`;
        })
        .join('\n');
}

generateAllocationChart(allocation) {
    return Object.entries(allocation)
        .map(([resource, data]) => {
            const used = Math.round((data.used / data.total) * 10);
            return `${resource}:\n[${'█'.repeat(used)}${'-'.repeat(10-used)}] ${(data.used/data.total*100).toFixed(1)}%`;
        })
        .join('\n');
}

generateThresholdIndicators(thresholds) {
    return thresholds
        .map(threshold => {
            const distance = threshold.current - threshold.limit;
            const indicator = distance < 0 ? '🟢' : distance < 10 ? '🟡' : '🔴';
            return `${indicator} ${threshold.metric}: ${threshold.current}/${threshold.limit}`;
        })
        .join('\n');
}

formatOptimizations(optimizations) {
    return optimizations
        .map(opt => {
            const impact = '↑'.repeat(Math.round(opt.impact));
            return `• ${opt.suggestion} (${impact})`;
        })
        .join('\n');
}

formatGrowthStrategy(strategy) {
    return strategy
        .map((phase, i) => {
            const timeline = `${phase.start} → ${phase.end}`;
            return `${i + 1}. ${timeline}: ${phase.action}`;
        })
        .join('\n');
}
