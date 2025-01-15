const Command = require('../../structures/Command');
const axios = require('axios');

class WeatherCommand extends Command {
    constructor() {
        super({
            name: 'weather',
            aliases: ['forecast'],
            description: 'Get weather information',
            category: 'tools',
            usage: '.weather <city>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a city name!');
        }

        const city = args.join(' ');
        await message.reply('🔍 *Fetching weather data...*');

        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.WEATHER_API_KEY}`
            );

            const weather = response.data;
            const forecast = `╭─❒ 『 WEATHER INFO 』 ❒
│
├─❒ 📍 *Location:* ${weather.name}, ${weather.sys.country}
├─❒ 🌡️ *Temperature:* ${weather.main.temp}°C
├─❒ 🌡️ *Feels Like:* ${weather.main.feels_like}°C
├─❒ 💧 *Humidity:* ${weather.main.humidity}%
├─❒ 🌪️ *Wind:* ${weather.wind.speed} m/s
├─❒ ☁️ *Clouds:* ${weather.clouds.all}%
├─❒ 🌅 *Sunrise:* ${this.formatTime(weather.sys.sunrise)}
├─❒ 🌇 *Sunset:* ${this.formatTime(weather.sys.sunset)}
│
├─❒ 🎯 *Condition:* 
│  ${weather.weather[0].main} (${weather.weather[0].description})
│
╰──────────────────❒`;

            await message.reply(forecast);

        } catch (error) {
            console.error('Weather error:', error);
            message.reply('❌ City not found or weather service unavailable.');
        }
    }

    formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString();
    }
}

module.exports = WeatherCommand; 