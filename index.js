require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot Zinda Hai!'));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`Server started.`));

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('message', async (ctx) => {
    console.log(`🚨 KUCH AAYA TELEGRAM SE:`, ctx.message.text);
    if (!ctx.message.text) return; 

    try {
        await ctx.sendChatAction('typing');
        
        // Direct Google Gemini ko request (No OpenAI package needed!)
        const apiKey = process.env.OPENAI_API_KEY; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: ctx.message.text }] }]
            })
        });

        const data = await response.json();
        
        // Agar Google ki taraf se koi error aaya toh logs mein chhap jayega
        if (data.error) {
            console.error('❌ Google API Error:', data.error.message);
            return ctx.reply('API key mein kuch issue hai, logs check karo.');
        }

        const replyText = data.candidates[0].content.parts[0].text;
        await ctx.reply(replyText);
        console.log('✅ Reply Sent Successfully!');

    } catch (error) {
        console.error('❌ Code Error:', error.message);
        ctx.reply('Main sun raha hu, par network error aa gaya.');
    }
});

bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log('🚀 BOT FULLY CONNECTED!');
}).catch(err => {
    // Ye error purane ghost ki wajah se aayega, isko ignore karna hai
    console.log("⏳ 409 Ghost Error (Isko ignore karo, purana server 1 min mein band ho jayega):", err.message);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));