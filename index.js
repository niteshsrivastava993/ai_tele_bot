require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const express = require('express');

// Render Server Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is Alive!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));

// Bot & AI Setup
const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

bot.start((ctx) => ctx.reply('Hello Nitesh! Bot ab finally live hai.'));

bot.on('text', async (ctx) => {
    try {
        await ctx.sendChatAction('typing');
        const aiResponse = await openai.chat.completions.create({
            model: "meta-llama/llama-3.1-8b-instruct:free", // Hamesha chalne wala free model
            messages: [{ role: "user", content: ctx.message.text }],
        });
        await ctx.reply(aiResponse.choices[0].message.content);
    } catch (error) {
        console.error('API Error:', error.message);
        ctx.reply('Bot thoda busy hai, 5 second baad try karein.');
    }
});

// THE MAGIC LINE: Ye line 409 Conflict ko hamesha ke liye rok degi
bot.launch({ dropPendingUpdates: true }).then(() => console.log('🚀 BOT CONNECTED!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));