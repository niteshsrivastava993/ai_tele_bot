require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const RENDER_URL = process.env.RENDER_EXTERNAL_URL; 
const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;

app.use(bot.webhookCallback(WEBHOOK_PATH));
app.get('/', (req, res) => res.send('Bot Groq AI ke saath Zinda Hai!'));

// Google gaya bhaad mein, ab hum direct fast Groq API use karenge
async function getGroqReply(text) {
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Llama 3 ka superfast free model
                messages: [{ role: "user", content: text }]
            })
        });
        const data = await res.json();
        if (data.error) return "❌ Groq API Error: " + data.error.message;
        return data.choices[0].message.content;
    } catch (e) {
        return "❌ Network issue aa gaya AI se baat karne mein.";
    }
}

bot.on('text', async (ctx) => {
    try {
        const waitMessage = await ctx.reply("⏳ Ruko, soch raha hu...");
        const aiReply = await getGroqReply(ctx.message.text);
        await ctx.telegram.deleteMessage(ctx.chat.id, waitMessage.message_id);
        await ctx.reply(aiReply);
    } catch (error) {
        console.error("Bot Error:", error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 SERVER CHAL PADA PORT ${PORT} PAR`);
    if (RENDER_URL) {
        try {
            await bot.telegram.setWebhook(`${RENDER_URL}${WEBHOOK_PATH}`, { drop_pending_updates: true });
            console.log('✅ WEBHOOK SET SUCCESSFUL!');
        } catch (e) {
            console.log('❌ Webhook Error:', e.message);
        }
    }
});