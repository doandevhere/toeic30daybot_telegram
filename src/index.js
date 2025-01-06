import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { Telegraf } from "telegraf";
import User from "./models/User.js";
import Word from "./models/Word.js";
import {
  analyzeWordPairs,
  generateQuizQuestion,
  generateRandomWord,
  generateWordInfo,
} from "./services/geminiService.js";
import {
  formatProfile,
  formatQuiz,
  formatWordInfo,
  formatWordList,
  formatWordPairs,
} from "./utils/formatters.js";
import VocabularyBank from "./models/VocabularyBank.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("TOEIC Bot Server is running!");
});

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
• /news\\- Get 5 to 10 word pairs from the article url
`;
  await ctx.replyWithMarkdownV2(message);
});

// New word command
bot.command("new_word", async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id });

    // Get learned words
    const learnedWords = await Word.find({
      _id: { $in: user.wordsLearned },
    }).select("word");

    // Get random word from VocabularyBank excluding learned words
    const randomVocab = await VocabularyBank.aggregate([
      { 
        $match: { 
          isActive: true,
          word: { $nin: learnedWords.map(w => w.word) } 
        } 
      },
      { $sample: { size: 1 } }
    ]);
    
    if (!randomVocab || randomVocab.length === 0) {
      return ctx.reply("You have learned all available words! Please wait for new words to be added.");
    }

    const selectedWord = randomVocab[0];

    // Generate detailed word info using Gemini
    const wordInfo = await generateWordInfo(selectedWord.word);
    
    const word = await Word.findOneAndUpdate(
      { word: wordInfo.word.toLowerCase(), userId: user._id },
      { ...wordInfo, userId: user._id },
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

// Get text content from URL
async function getTextFromUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    // Simple HTML to text conversion
    const text = html
      .replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "")
      .replace(/<style[^>]*>([\S\s]*?)<\/style>/gim, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text;
  } catch (error) {
    console.error("Error fetching URL content:", error);
    throw error;
  }
}

// News command
bot.command("news", async (ctx) => {
  try {
    const url = ctx.message.text.split(" ")[1];
    console.log({ url });
    if (!url) {
      return ctx.replyWithMarkdownV2(
        "*Please provide a URL to analyze\\!*\nExample: /news https://example.com"
      );
    }

    const textContent = await getTextFromUrl(url);
    const wordPairs = await analyzeWordPairs(textContent);
    await ctx.replyWithMarkdownV2(formatWordPairs(wordPairs.wordPairs));
  } catch (error) {
    console.error("Error in news command:", error);
    await ctx.reply(
      "Sorry, there was an error analyzing the content. Please try again."
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

// Start the express server and bot
Promise.all([
  new Promise((resolve) =>
    app.listen(port, () => {
      console.log(`Express server is running on port ${port}`);
      resolve();
    })
  ),
  bot.launch().then(() => console.log("Bot is running")),
]).catch((err) => console.error("Startup error:", err));

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  process.exit(0);
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  process.exit(0);
});
