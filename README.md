# TOEIC Vocabulary Telegram Bot

- This repository contains a Telegram bot designed to assist users in learning new TOEIC vocabulary effectively. The bot leverages AI to provide engaging and interactive vocabulary learning experiences.
- Demo 🚀: [@toeic30daybot](https://t.me/dailytoeic_bot) on Telegram

## Features

- **Daily Vocabulary:** Receive a set of TOEIC vocabulary words daily with the `/new_word` command.
- **Quizzes:** Test your knowledge of learned vocabulary with the `/quiz` command.
- **Word Lookup:** Look up definitions, examples, and details for any English word using `/lookup <word>`.
- **Flashcards:** View detailed information about a word, including definition and example sentences.
- **Progress Tracking:** Use `/my_profile` to view your learning statistics and streaks.
- **Word List:** Access all the words you have learned using `/word_list`.
- **Error Handling:** The bot handles errors gracefully, ensuring uninterrupted user experience.

## Technology Stack

- **Programming Language:** Node.js
- **Database:** MongoDB for storing user data and vocabulary information
- **AI Model:** Gemini Flash 1.5 for generating word-related content
- **Telegram Bot API:** For communication with Telegram users

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/doandevhere/telegram-toeic-bot.git
   cd telegram-toeic-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file and add your Telegram bot token and MongoDB connection string:

   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the bot:
   ```bash
   npm start
   ```

## Usage

1. Start a conversation with the bot on Telegram by searching for its username.
2. Use the commands:
   - `/start` to begin using the bot.
   - `/new_word` to learn a new TOEIC word.
   - `/quiz` to test your vocabulary knowledge.
   - `/lookup <word>` to look up any English word.
   - `/my_profile` to view your learning statistics.
   - `/word_list` to see all words you've learned.

## Development Timeline

This bot was developed by leveraging the Claude Sonet 3.5 AI model in just **30 minutes**.
