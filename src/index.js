import dotenv from "dotenv";
import mongoose from "mongoose";
import { Telegraf } from "telegraf";
import User from "./models/User.js";
import Word from "./models/Word.js";
import {
  generateQuizQuestion,
  generateWordInfo,
} from "./services/geminiService.js";
import {
  formatProfile,
  formatQuiz,
  formatWordInfo,
  formatWordList,
} from "./utils/formatters.js";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to ensure user exists
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();

  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) {
    await User.create({
      telegramId: ctx.from.id,
      username: ctx.from.username,
    });
  }
  return next();
});

// Start command
bot.command("start", async (ctx) => {
  const message = `
*Welcome to TOEIC Vocabulary Bot\\!*
\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-
Available commands:
• /new\\_word \\- Learn a new TOEIC word
• /quiz \\- Test your vocabulary knowledge
• /lookup \\<word\\> \\- Look up any English word
• /my\\_profile \\- View your learning statistics
• /word\\_list \\- See all words you've learned
`;
  await ctx.replyWithMarkdownV2(message);
});

// New word command
bot.command("new_word", async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id });
    const wordList = [
      "efficient",
      "implement",
      "negotiate",
      "collaborate",
      "deadline",
      "initiative",
      "objective",
      "strategy",
    ];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];

    const wordInfo = await generateWordInfo(randomWord);
    const word = await Word.findOneAndUpdate(
      { word: wordInfo.word.toLowerCase() },
      wordInfo,
      { upsert: true, new: true }
    );

    if (!user.wordsLearned.includes(word._id)) {
      user.wordsLearned.push(word._id);
      await user.updateStreak();
      await user.save();
    }

    await ctx.replyWithMarkdownV2(formatWordInfo(wordInfo));
  } catch (error) {
    console.error("Error in new_word command:", error);
    await ctx.reply(
      "Sorry, there was an error generating a new word. Please try again."
    );
  }
});

// Quiz command
bot.command("quiz", async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id }).populate(
      "wordsLearned"
    );
    if (!user.wordsLearned.length) {
      return ctx.replyWithMarkdownV2(
        "*Learn some words first using /new\\_word\\!*"
      );
    }

    const randomWord =
      user.wordsLearned[Math.floor(Math.random() * user.wordsLearned.length)];
    const quiz = await generateQuizQuestion(
      randomWord.word,
      randomWord.definition
    );
    await ctx.replyWithMarkdownV2(formatQuiz(quiz));

    user.quizStats.totalAttempts += 1;
    await user.save();
  } catch (error) {
    console.error("Error in quiz command:", error);
    await ctx.reply(
      "Sorry, there was an error generating a quiz. Please try again."
    );
  }
});

// Lookup command
bot.command("lookup", async (ctx) => {
  try {
    const word = ctx.message.text.split(" ")[1];
    if (!word) {
      return ctx.replyWithMarkdownV2(
        "*Please provide a word to look up\\!*\nExample: /lookup efficiency"
      );
    }

    const wordInfo = await generateWordInfo(word);
    await ctx.replyWithMarkdownV2(formatWordInfo(wordInfo));
  } catch (error) {
    console.error("Error in lookup command:", error);
    await ctx.reply(
      "Sorry, there was an error looking up the word. Please try again."
    );
  }
});

// Profile command
bot.command("my_profile", async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id });
    await ctx.replyWithMarkdownV2(formatProfile(user));
  } catch (error) {
    console.error("Error in my_profile command:", error);
    await ctx.reply(
      "Sorry, there was an error fetching your profile. Please try again."
    );
  }
});

// Word list command
bot.command("word_list", async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id }).populate(
      "wordsLearned"
    );
    await ctx.replyWithMarkdownV2(formatWordList(user.wordsLearned));
  } catch (error) {
    console.error("Error in word_list command:", error);
    await ctx.reply(
      "Sorry, there was an error fetching your word list. Please try again."
    );
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  ctx.reply("An error occurred. Please try again later.");
});

// Start the bot
bot
  .launch()
  .then(() => console.log("Bot is running"))
  .catch((err) => console.error("Bot launch error:", err));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
