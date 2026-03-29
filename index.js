require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');

// 1. Initialize Bot & AI Clients (OpenRouter Setup)
const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", // <-- Naya rasta OpenRouter ke liye
    apiKey: process.env.OPENAI_API_KEY,
});

// 2. Welcome Message Setup
bot.start((ctx) => {
    ctx.reply('Hello! Main ek AI Assistant hoon. Aap apna sawaal puch sakte hain.');
});

// 3. The Main Logic: Catching text and sending to AI
bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;

    try {
        // User ko dikhne ke liye ki bot type kar raha hai
        await ctx.sendChatAction('typing');

        // OpenRouter (Gemini Free) ko prompt bhejna
        const aiResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash:free", // <-- Free fast model yahan set hai
            messages: [{ role: "user", content: userMessage }],
        });

        // AI ka reply extract karke Telegram par wapas bhejna
        const replyText = aiResponse.choices[0].message.content;
        ctx.reply(replyText);

    } catch (error) {
        console.error('API Error:', error);
        ctx.reply('Sorry, thodi technical problem aa gayi hai. Kuch der baad try karein.');
    }
});

// 4. Start the Bot
bot.launch().then(() => {
    console.log('🤖 Bot is up and running in the background!');
});

// Graceful stop settings
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// 5. Express Server for Render Web Service
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 AI Bot Server is Alive and Running!');
});

app.listen(PORT, () => {
    console.log(`Web server is running on port ${PORT}`);
});