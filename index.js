require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

bot.start((ctx) => ctx.reply('Hello! Main live hoon. Puchiye apna sawaal!'));

bot.on('text', async (ctx) => {
    console.log(`📩 Message received: ${ctx.message.text}`); // Ye logs mein dikhega
    const userMessage = ctx.message.text;

    try {
        await ctx.sendChatAction('typing');

        const aiResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash:free", 
            messages: [{ role: "user", content: userMessage }],
        });

        const replyText = aiResponse.choices[0].message.content;
        await ctx.reply(replyText);
        console.log("✅ Reply sent successfully!");

    } catch (error) {
        console.error('❌ API Error Details:', error.message);
        ctx.reply('Thoda load zyada hai, 10 second baad dobara message bhejein.');
    }
});

bot.launch().then(() => console.log('🚀 BOT CONNECTED TO TELEGRAM!'));

// Render Health Check
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is Alive!'));
app.listen(process.env.PORT || 3000);