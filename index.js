require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Health Check for Render (This keeps the server alive)
app.get('/', (req, res) => res.send('Bot is Alive!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

bot.start((ctx) => ctx.reply('Hello Nitesh! Bot ab live hai. Puchiye sawaal.'));

bot.on('text', async (ctx) => {
    console.log(`📩 Received: ${ctx.message.text}`);
    try {
        await ctx.sendChatAction('typing');
        const aiResponse = await openai.chat.completions.create({
            model: "google/gemma-2-9b-it:free", 
            messages: [{ role: "user", content: ctx.message.text }],
        });
        await ctx.reply(aiResponse.choices[0].message.content);
    } catch (error) {
        console.error('❌ Error:', error.message);
        ctx.reply('AI busy hai, please 10 sec baad try karein.');
    }
});

bot.launch().then(() => console.log('🚀 BOT CONNECTED!'));

// Handle stop signals
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));