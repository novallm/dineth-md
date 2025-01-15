const Command = require('../../structures/Command');
const os = require('os');
const si = require('systeminformation');

class SystemInfoCommand extends Command {
    constructor() {
        super({
            name: 'system',
            description: 'Show system information',
            category: 'tools'
        });
    }

    async execute(message) {
        try {
            const cpu = await si.cpu();
            const mem = await si.mem();
            const disk = await si.fsSize();
            
            const sysInfo = `🖥️ *SYSTEM INFORMATION*\n\n` +
                `*OS:* ${os.type()} ${os.release()}\n` +
                `*CPU:* ${cpu.manufacturer} ${cpu.brand}\n` +
                `*Cores:* ${cpu.cores}\n` +
                `*RAM:* ${(mem.used/1024/1024/1024).toFixed(2)}GB / ${(mem.total/1024/1024/1024).toFixed(2)}GB\n` +
                `*Disk:* ${(disk[0].used/1024/1024/1024).toFixed(2)}GB / ${(disk[0].size/1024/1024/1024).toFixed(2)}GB\n` +
                `*Node:* ${process.version}\n` +
                `*Speed:* ${cpu.speed}GHz`;

            await message.reply(sysInfo);
        } catch (error) {
            console.error('System info error:', error);
            message.reply('❌ Failed to get system information.');
        }
    }
}

module.exports = SystemInfoCommand; 