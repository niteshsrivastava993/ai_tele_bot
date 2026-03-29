require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot zinda hai!'));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`Server listening...`));

const bot = new Telegraf(process.env.BOT_TOKEN);

// YAHAN CHANGE HUA HAI: OpenRouter ki jagah direct Google Gemini ka server
const openai = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.OPENAI_API_KEY, 
});

bot.on('message', async (ctx) => {
    console.log(`🚨 KUCH AAYA TELEGRAM SE:`, ctx.message.text);
    if (!ctx.message.text) return; 

    try {
        await ctx.sendChatAction('typing');
        const aiResponse = await openai.chat.completions.create({
            // Ye Google ka official model ID hai, hamesha chalega
            model: "gemini-1.5-flash", 
            messages: [{ role: "user", content: ctx.message.text }],
        });
        await ctx.reply(aiResponse.choices[0].message.content);
    } catch (error) {
        console.error('❌ API Error:', error.message);
        ctx.reply('Kuch network issue hai, thodi der baad try karein.');
    }
});

bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log('🚀 BOT CONNECTED!');
}).catch(err => console.log("❌ LAUNCH ERROR:", err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));