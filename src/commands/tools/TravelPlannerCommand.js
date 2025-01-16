const { MessageType } = require('@whiskeysockets/baileys');

class TravelPlannerCommand {
    constructor() {
        this.name = 'travel';
        this.description = 'Plan trips, get travel info, and manage itineraries';
    }

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(`*✈️ Travel Planner Commands*\n\n` +
                `*.travel destination <city>* - Get destination info\n` +
                `*.travel weather <city>* - Check weather forecast\n` +
                `*.travel itinerary <days>* - Create travel itinerary\n` +
                `*.travel checklist* - Get packing checklist\n` +
                `*.travel convert <amount> <from> <to>* - Currency conversion\n` +
                `*.travel phrases <language>* - Essential travel phrases`);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'destination':
                const city = args.slice(1).join(' ');
                if (!city) {
                    return message.reply('❌ Please specify a city.\nExample: *.travel destination "Paris"*');
                }

                // Implement actual destination API integration
                return message.reply(`*🗺️ Destination Guide: ${city}*\n\n` +
                    `🏛️ Top Attractions:\n` +
                    `1. Famous Landmark A\n` +
                    `2. Historic Site B\n` +
                    `3. Popular Museum C\n\n` +
                    `🍴 Local Cuisine:\n` +
                    `• Traditional Dish 1\n` +
                    `• Famous Food 2\n\n` +
                    `💡 Best Time to Visit: Spring/Fall\n` +
                    `💰 Average Daily Budget: $100-150`);

            case 'weather':
                const weatherCity = args.slice(1).join(' ');
                if (!weatherCity) {
                    return message.reply('❌ Please specify a city.\nExample: *.travel weather "Tokyo"*');
                }

                // Implement weather API integration
                return message.reply(`*🌤️ Weather Forecast: ${weatherCity}*\n\n` +
                    `Today: Sunny, 25°C (77°F)\n` +
                    `Tomorrow: Partly Cloudy, 23°C (73°F)\n` +
                    `Day After: Light Rain, 20°C (68°F)`);

            case 'itinerary':
                const days = parseInt(args[1]);
                if (!days || isNaN(days)) {
                    return message.reply('❌ Please specify number of days.\nExample: *.travel itinerary 3*');
                }

                return message.reply(`*📅 ${days}-Day Travel Itinerary*\n\n` +
                    `Day 1:\n` +
                    `🌅 Morning: City Tour\n` +
                    `🏛️ Afternoon: Museum Visit\n` +
                    `🌙 Evening: Local Dinner\n\n` +
                    `Day 2:\n` +
                    `🏖️ Morning: Beach/Park\n` +
                    `🛍️ Afternoon: Shopping\n` +
                    `🎭 Evening: Cultural Show\n\n` +
                    `Day 3:\n` +
                    `🍳 Morning: Cooking Class\n` +
                    `🏰 Afternoon: Historical Sites\n` +
                    `🌆 Evening: Sunset Views`);

            case 'checklist':
                return message.reply(`*✅ Travel Packing Checklist*\n\n` +
                    `📄 Documents:\n` +
                    `□ Passport/ID\n` +
                    `□ Travel Insurance\n` +
                    `□ Booking Confirmations\n\n` +
                    `👕 Clothing:\n` +
                    `□ Weather-appropriate clothes\n` +
                    `□ Comfortable shoes\n` +
                    `□ Sleepwear\n\n` +
                    `🔌 Electronics:\n` +
                    `□ Phone + Charger\n` +
                    `□ Power Bank\n` +
                    `□ Universal Adapter\n\n` +
                    `💊 Health:\n` +
                    `□ Medications\n` +
                    `□ First Aid Kit\n` +
                    `□ Hand Sanitizer`);

            case 'convert':
                const amount = args[1];
                const fromCurrency = args[2]?.toUpperCase();
                const toCurrency = args[3]?.toUpperCase();

                if (!amount || !fromCurrency || !toCurrency) {
                    return message.reply('❌ Please specify amount and currencies.\nExample: *.travel convert 100 USD EUR*');
                }

                // Implement actual currency conversion API
                return message.reply(`*💱 Currency Conversion*\n\n${amount} ${fromCurrency} ≈ ${(amount * 0.85).toFixed(2)} ${toCurrency}`);

            case 'phrases':
                const language = args[1]?.toLowerCase();
                if (!language) {
                    return message.reply('❌ Please specify language.\nExample: *.travel phrases spanish*');
                }

                const phrases = {
                    spanish: [
                        { phrase: 'Hola', meaning: 'Hello' },
                        { phrase: 'Gracias', meaning: 'Thank you' },
                        { phrase: '¿Dónde está...?', meaning: 'Where is...?' }
                    ],
                    french: [
                        { phrase: 'Bonjour', meaning: 'Hello' },
                        { phrase: 'Merci', meaning: 'Thank you' },
                        { phrase: 'Où est...?', meaning: 'Where is...?' }
                    ]
                };

                const languagePhrases = phrases[language];
                if (!languagePhrases) {
                    return message.reply('❌ Language not found in database.');
                }

                return message.reply(`*🗣️ Essential ${language.charAt(0).toUpperCase() + language.slice(1)} Phrases*\n\n` +
                    languagePhrases.map(p => `• ${p.phrase}\n  (${p.meaning})`).join('\n\n'));

            default:
                return message.reply('❌ Invalid sub-command. Use *.travel* to see available options.');
        }
    }
}

module.exports = TravelPlannerCommand; 