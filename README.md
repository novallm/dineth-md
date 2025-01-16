# DinethBot - Advanced WhatsApp Bot

A powerful WhatsApp bot with AI capabilities, media processing, group management, and extensive features.

## 🚀 Quick Start

1. **Clone the Repository**
```bash
git clone https://github.com/novallm/dineth-md.git
cd dineth-md
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
- Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- Edit `.env` and add your API keys:
  - OPENAI_API_KEY
  - GOOGLE_CLOUD_API_KEY
  - MONGODB_URI
  - Other required keys

4. **Start the Bot**
```bash
npm start
```

5. **Scan QR Code**
- A QR code will appear in your terminal
- Scan it with WhatsApp on your phone
- The bot is now connected!

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB
- Redis
- FFmpeg (for media processing)
- Git

## 🛠️ Installation Steps

### 1. System Requirements

#### Windows
- Install Node.js from [nodejs.org](https://nodejs.org)
- Install MongoDB from [mongodb.com](https://mongodb.com)
- Install Redis from [redis.io](https://redis.io)
- Install Git from [git-scm.com](https://git-scm.com)

#### Linux/Mac
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Install Redis
sudo apt-get install -y redis-server

# Install FFmpeg
sudo apt-get install -y ffmpeg
```

### 2. Database Setup

1. Start MongoDB:
```bash
sudo service mongodb start
```

2. Start Redis:
```bash
sudo service redis-server start
```

3. Create database:
```bash
mongosh
use dineth_bot
```

### 3. Bot Configuration

1. Generate API Keys:
- OpenAI API: [platform.openai.com](https://platform.openai.com)
- Google Cloud: [console.cloud.google.com](https://console.cloud.google.com)
- Other required services

2. Configure `.env`:
```env
BOT_NAME=DinethBot
PREFIX=!
MONGODB_URI=mongodb://localhost:27017/dineth_bot
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_key_here
GOOGLE_CLOUD_API_KEY=your_key_here
```

## 🎯 Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### PM2 (Recommended for production)
```bash
npm install -g pm2
pm2 start index.js --name dineth-bot
```

## 📱 Connecting WhatsApp

1. Start the bot
2. Scan QR code with WhatsApp
3. Bot is ready when you see "Connected to WhatsApp"

## 🤖 Using Commands

Basic commands:
- `!help` - Show all commands
- `!image ai <prompt>` - Generate AI images
- `!sticker` - Create sticker from media
- `!translate <lang> <text>` - Translate text
- `!poll create` - Create a poll

Admin commands:
- `!ban @user` - Ban user
- `!settings` - Bot settings
- `!broadcast` - Send broadcast

## 🔧 Troubleshooting

1. **QR Code Issues**
- Delete `auth_info` folder
- Restart bot
- Scan new QR code

2. **Connection Issues**
```bash
# Clear cache
npm cache clean --force
# Remove modules
rm -rf node_modules
# Reinstall
npm install
```

3. **Database Issues**
```bash
# Check MongoDB status
sudo service mongodb status
# Check Redis status
sudo service redis-server status
```

## 📚 Development

### Project Structure
```
src/
├── handlers/       # Feature handlers
├── commands/      # Bot commands
├── utils/         # Utilities
└── config/        # Configuration
```

### Adding Commands
1. Create command file in `src/commands/`
2. Extend base command class
3. Register in CommandHandler
4. Test with `!help`

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 🆘 Support

- Join support group: [WhatsApp Group](https://chat.whatsapp.com/xxx)
- Report issues on GitHub
- Contact developer: [Developer](https://wa.me/+94741566800)
