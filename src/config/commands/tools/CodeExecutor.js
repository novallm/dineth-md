const Command = require('../../structures/Command');
const axios = require('axios');

class CodeExecutor extends Command {
    constructor() {
        super({
            name: 'run',
            aliases: ['exec', 'code'],
            description: 'Execute code in various languages',
            category: 'tools',
            usage: '.run <language>\n<code>'
        });

        this.languages = {
            'js': 'nodejs',
            'python': 'python3',
            'java': 'java',
            'cpp': 'cpp',
            'php': 'php',
            'ruby': 'ruby'
        };
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 CODE EXECUTOR 』 ❒
│
├─❒ 💻 *Supported Languages:*
│ • JavaScript (js)
│ • Python (python)
│ • Java (java)
│ • C++ (cpp)
│ • PHP (php)
│ • Ruby (ruby)
│
├─❒ 📝 *Usage:*
│ .run <language>
│ <your code here>
│
├─❒ 📌 *Example:*
│ .run js
│ console.log('Hello World');
│
╰──────────────────❒`);
        }

        const lang = args[0].toLowerCase();
        const code = message.body.split('\n').slice(1).join('\n');

        if (!code) {
            return message.reply('❌ Please provide the code to execute!');
        }

        await message.reply('⚙️ *Executing code...*');

        try {
            const response = await axios.post('https://api.judge0.com/submissions', {
                source_code: code,
                language_id: this.languages[lang],
                stdin: ''
            });

            const result = `╭─❒ 『 CODE EXECUTION 』 ❒
│
├─❒ 📊 *Language:* ${lang}
├─❒ 🔄 *Status:* ${response.data.status.description}
├─❒ 🕒 *Time:* ${response.data.time} s
├─❒ 📝 *Memory:* ${response.data.memory} KB
│
├─❒ 📤 *Output:*
│ ${response.data.stdout || 'No output'}
│
├─❒ ❌ *Errors:*
│ ${response.data.stderr || 'No errors'}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

            await message.reply(result);

        } catch (error) {
            console.error('Code execution error:', error);
            message.reply('❌ Failed to execute code. Please check the syntax.');
        }
    }
}

module.exports = CodeExecutor; 