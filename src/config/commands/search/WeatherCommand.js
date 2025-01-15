const Command = require('../../structures/Command');
const axios = require('axios');

class WeatherCommand extends Command {
    constructor() {
        super({
            name: 'weather',
            description: 'Get weather information',
            category: 'search',
            usage: '!weather <city>',
            cooldown: 5
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a city name!');
        }

        const city = args.join(' ');

        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.WEATHER_API_KEY}`
            );

            const weather = response.data;
            const weatherText = `🌍 *Weather in ${weather.name}, ${weather.sys.country}*\n\n` +
                `🌡️ Temperature: ${weather.main.temp}°C\n` +
                `💧 Humidity: ${weather.main.humidity}%\n` +
                `🌪️ Wind Speed: ${weather.wind.speed} m/s\n` +
                `☁️ Conditions: ${weather.weather[0].description}\n` +
                `👁️ Visibility: ${(weather.visibility / 1000).toFixed(1)} km`;

            await message.client.sendText(message.key.remoteJid, weatherText);
        } catch (error) {
            console.error('Weather API error:', error);
            message.reply('❌ Failed to get weather information. Please check the city name.');
        }
    }
}

module.exports = WeatherCommand; 