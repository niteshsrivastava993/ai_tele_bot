require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot zinda hai!'));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`Server listening...`));

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

// Ye radar ab har cheez catch karega (Text, /start, Sticker sab kuch)
bot.on('message', async (ctx) => {
    console.log(`🚨 KUCH AAYA TELEGRAM SE! Message:`, ctx.message.text || 'Non-text item');
    
    if (!ctx.message.text) return; // Agar text nahi hai toh reply mat karo

    try {
        await ctx.sendChatAction('typing');
        const aiResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", 
            messages: [{ role: "user", content: ctx.message.text }],
        });
        await ctx.reply(aiResponse.choices[0].message.content);
    } catch (error) {
        console.error('❌ API Error:', error.message);
        ctx.reply('Main sun raha hu, par AI model nakhre kar raha hai.');
    }
});

// Asli Jadoo Yahan Hai: Ye apna naam khud batayega
bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log('🚀 BOT CONNECTED!');
    console.log(`🤖 MAIN IS NAAM SE ZINDA HU: @${bot.botInfo.username}`);
}).catch(err => console.log("❌ LAUNCH ERROR:", err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));