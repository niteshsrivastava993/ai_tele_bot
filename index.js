require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const RENDER_URL = process.env.RENDER_EXTERNAL_URL; 
const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;

app.use(bot.webhookCallback(WEBHOOK_PATH));
app.get('/', (req, res) => res.send('Nitesh Portfolio Bot is Live!'));

// 🧠 BOT KI MEMORY (Yaaddasht)
const userMemory = {};

async function getGroqReply(chatId, text) {
    // Agar user pehli baar message kar raha hai, toh uski memory profile banao
    if (!userMemory[chatId]) {
        userMemory[chatId] = [
            { role: "system", content: "You are a highly intelligent and professional AI assistant. You were created by Nitesh, an expert Full-Stack Developer. Answer concisely and politely." }
        ];
    }

    // User ka naya message memory mein daalo
    userMemory[chatId].push({ role: "user", content: text });

    // Memory limit: Puraani baatein delete karo taaki token limit cross na ho (Last 10 messages yaad rakhega)
    if (userMemory[chatId].length > 11) {
        userMemory[chatId] = [userMemory[chatId][0], ...userMemory[chatId].slice(-10)];
    }

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: userMemory[chatId]
            })
        });
        const data = await res.json();
        if (data.error) return "❌ Groq API Error: " + data.error.message;
        
        const aiReply = data.choices[0].message.content;
        
        // AI ka reply bhi memory mein save karo
        userMemory[chatId].push({ role: "assistant", content: aiReply });

        return aiReply;
    } catch (e) {
        return "❌ Network issue aa gaya AI se baat karne mein.";
    }
}

// 🎯 THE PORTFOLIO MESSAGE (Client sabse pehle ye dekhega)
bot.start((ctx) => {
    const welcomeMsg = `🚀 *Welcome to the AI Bot Demo!*\n\nI am a lightning-fast, intelligent AI assistant powered by Llama-3.3.\n\n👨‍💻 *Created by:* Nitesh (Full-Stack Developer)\n💼 *Looking for a custom bot for your business, Discord, or Crypto community?* DM my creator to get one built in 24 hours!\n\n_Send me any message to test my speed and memory._`;
    ctx.replyWithMarkdown(welcomeMsg);
});

// 🧹 MEMORY CLEAR COMMAND
bot.command('clear', (ctx) => {
    userMemory[ctx.chat.id] = null; // Memory delete
    ctx.reply("🧹 Meri memory clear ho chuki hai. Chalo nayi baat shuru karte hain!");
});

// NORMAL TEXT HANDLING
bot.on('text', async (ctx) => {
    try {
        const waitMessage = await ctx.reply("⏳ Ruko, soch raha hu...");
        const aiReply = await getGroqReply(ctx.chat.id, ctx.message.text);
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