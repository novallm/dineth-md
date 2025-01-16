const config = {
    botName: "Dineth MD V1",
    version: "1.0.0",
    creator: "Dineth Nethsara",
    ownerNumber: "94741566800",
    prefix: "!",
    theme: {
        primary: "#ff0000",    // Red
        secondary: "#0000ff",  // Blue
        accent: "#ffffff"      // White
    },
    apis: {
        openai: process.env.OPENAI_API_KEY,
        weather: process.env.WEATHER_API_KEY,
        spotify: process.env.SPOTIFY_API_KEY,
        youtube: process.env.YOUTUBE_API_KEY,
        instagram: process.env.INSTAGRAM_API_KEY,
        // Add other API keys
    },
    features: {
        nsfw: false,           // Disabled by default
        autoUpdate: true,
        offlineMode: true,
        multilingual: true,
        antiSpam: true,
        antiLink: true,
        autoBackup: true
    },
    database: {
        uri: process.env.MONGODB_URI,
        backupInterval: 24 * 60 * 60 * 1000 // 24 hours
    }
};

module.exports = config; 