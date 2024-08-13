require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const cron = require('node-cron'); // Add node-cron for scheduling
const app = express();
const token = process.env.TOKEN || '7233165030:AAEO2yudL-ypxo3k3Z1fyxeld25XeS39JWc';
const bot = new Telegraf(token);

// Web App Link
const web_link = 'https://lunarcoin.vercel.app';
const Telegram = 'https://t.me/lunarcoincommunity';

// Array to store user IDs
let users = [];

// Start Handler
bot.start(async (ctx) => {
  try {
    const startPayload = ctx.startPayload || '';
    const userId = ctx.chat.id.toString(); // Ensure userId is a string
    const urlSent = `${web_link}?ref=${startPayload}&userId=${userId}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username.replace(/[-.!]/g, '\\$&')}` : user.first_name;

    const messageText = `
    *Hey, ${userName}* Prepare for an out-of-this-world adventure! 🌌🚀
    
    TheLunarCoin Power mini-game has just landed on Telegram, and it’s going to be epic!
    
    ⚡ Get ready to be hooked! ⚡
    
    🤑 Farm tokens, conquer challenges, and score insane loot.
    
    💥 Form squads and invite your crew for double the fun (and double the tokens)!
    
    With TheLunarCoin, mastering cryptocurrency is a breeze. From wallets to trading, earning, and cards, we’ve got everything you need to dominate the cryptoverse!
    
    🚀 Let the lunar adventure begin! 🚀
        `;

    await ctx.replyWithMarkdown(messageText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Launch", web_app: { url: urlSent } }],
          [{ text: "Join Community", url: Telegram }]
        ]
      }
    });

      // Add user data to users array if not already present
    if (!users.find(user => user.userId === userId)) {
      users.push({ userId, userName });
      console.log('User added:', userId);
      console.log('Current users array:', users);
    }

    let refUserId = '001'; // Default referral ID

    if (startPayload.startsWith('ref_')) {
      refUserId = startPayload.split('_')[1];
      if (refUserId === userId) {
        refUserId = '001'; // Use default if referral ID is same as user ID
      }
    }

    try {
      await axios.put('https://lunarapp.thelunarcoin.com/backend/api/squad/add', {
        refUserId: refUserId.toString(), // Ensure refUserId is a string
        newUserId: userId.toString(), // Ensure newUserId is a string
        newUserName: userName.toString() // Ensure newUserName is a string
      });
      
    } catch (apiError) {
      console.error('Error sending referral data to API:', apiError);
    }
  } catch (error) {
    console.error('Error in start handler:', error);
  }
});

// Referral Command Handler
bot.command('referral', async (ctx) => {
  const referralCode = Math.random().toString(36).substring(7);
  ctx.reply(`Your referral code is: ${referralCode}`);
});

bot.command('totalusers', async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const totalUsers = await bot.telegram.getChatMembersCount(chatId);
    await ctx.reply(`Total number of users in this chat: ${totalUsers}`);
  } catch (error) {
    console.error('Error retrieving total users:', error);
    await ctx.reply('Error retrieving total users. Please try again later.');
  }
});


// Schedule notifications every 5 hours
cron.schedule('0 */5 * * *', async () => {
  console.log('Sending notifications to users array:', users);
  for (const user of users) {
    try {
      await bot.telegram.sendMessage(user.userId, 
        `🌟 Hey ${user.userName}! 🌟\n\nDon't miss out on your chance to boost your points! 🚀✨ 
    \nClaim your farm harvest now and maximize your rewards. 
    \nRemember, early birds get the best deals! 🌕💫\n\nJoin our community and stay ahead of the game:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Launch", web_app: { url: web_link } }]
            ]
          }
        }
      );
    } catch (err) {
      console.error('Error sending message to user', user.userId, ':', err);
    }
  }
  console.log("Notifications sent to all users!");
});


// Express server setup
app.use(express.json());

// Launch the bot
bot.launch().then(() => {
  console.log('Bot is running...');
}).catch(error => {
  console.error('Error launching bot:', error);
});

// Start Express server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

module.exports = bot;
