require('dotenv').config();
const DinethBot = require('./src/DinethBot');

async function startBot() {
    const bot = new DinethBot();
    await bot.initialize();
}

startBot().catch(console.error); 