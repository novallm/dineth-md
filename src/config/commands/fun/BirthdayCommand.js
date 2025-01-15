const Command = require('../../structures/Command');
const moment = require('moment');

class BirthdayCommand extends Command {
    constructor() {
        super({
            name: 'birthday',
            aliases: ['bday', 'celebrate'],
            description: 'Birthday celebrations and countdown',
            category: 'fun'
        });
    }

    async execute(message, args) {
        const ownerBirthday = moment('2024-06-16');
        const now = moment();
        const daysUntil = ownerBirthday.diff(now, 'days');

        if (now.format('MM-DD') === '06-16') {
            // It's owner's birthday!
            const celebrationText = `╭─❒ 『 🎉 HAPPY BIRTHDAY! 』 ❒
│ 
├─❒ 🎂 *Special Day Alert*
│ Today is Dineth's Birthday! 
│ 
├─❒ 🎈 *Wish Him:*
│ wa.me/94741566800
│
├─❒ 🎁 *Birthday Boy Info*
│ • Name: Dineth Nethsara
│ • Age: ${now.diff(moment('2007-06-16'), 'years')}
│ • Country: Sri Lanka 🇱🇰
│
╰──────────────────❒`;

            await message.client.sendMessage(message.key.remoteJid, {
                image: { url: 'https://raw.githubusercontent.com/DinethNethsara/DinethMD/main/birthday.jpg' },
                caption: celebrationText,
                gifPlayback: true
            });
        } else {
            const countdownText = `╭─❒ 『 🎂 BIRTHDAY COUNTDOWN 』 ❒
│ 
├─❒ 📅 *Next Birthday:*
│ ${daysUntil} days until Dineth's Birthday!
│ 
├─❒ 📌 *Mark Your Calendar*
│ Date: June 16, 2024
│ 
├─❒ 🎉 *Get Ready To Celebrate*
│ Don't forget to wish! 
│
╰──────────────────❒`;

            await message.reply(countdownText);
        }
    }
}

module.exports = BirthdayCommand; 