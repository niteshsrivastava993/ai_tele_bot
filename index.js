require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Tumhara exact Render URL
const RENDER_URL = "https://ai-tele-bot-503x.onrender.com";
const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;

// Webhook setup (Ye 409 Conflict ko hamesha ke liye maar dega)
app.use(bot.webhookCallback(WEBHOOK_PATH));

app.get('/', (req, res) => res.send('Bot Webhook ke saath 100% Active Hai!'));

// Native Gemini AI Function (No 3rd party package, No 404 Error)
async function getGeminiReply(text) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.OPENAI_API_KEY}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
        });
        const data = await res.json();
        if (data.error) return "❌ Google API Key mein error hai: " + data.error.message;
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "❌ Network issue aa gaya AI se baat karne mein.";
    }
}

// Jab bhi koi text aayega, bot ye karega
bot.on('text', async (ctx) => {
    try {
        // 1. Sabse pehle instant reply taaki tumhe pata chale bot zinda hai
        const waitMessage = await ctx.reply("⏳ Ruko, soch raha hu...");
        
        // 2. Phir AI se reply mangega
        const aiReply = await getGeminiReply(ctx.message.text);
        
        // 3. Purana message delete karke AI ka reply dega
        await ctx.telegram.deleteMessage(ctx.chat.id, waitMessage.message_id);
        await ctx.reply(aiReply);
        
    } catch (error) {
        console.error("Bot Error:", error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 SERVER CHAL PADA PORT ${PORT} PAR`);
    try {
        // Start hote hi Telegram ko Webhook bata dega (Drop pending updates ke saath)
        await bot.telegram.setWebhook(`${RENDER_URL}${WEBHOOK_PATH}`, { drop_pending_updates: true });
        console.log('✅ WEBHOOK SET SUCCESSFUL! (Ab kabhi 409 nahi aayega)');
    } catch (e) {
        console.log('❌ Webhook Set Error:', e.message);
    }
});