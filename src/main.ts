import cron from "node-cron";
import { Telegraf } from "telegraf";

import { getDailyPoem, getRandomPoem } from "./poems";

const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');
if (!GROUP_ID) throw new Error('"GROUP_ID" env var is required!');

const bot = new Telegraf(BOT_TOKEN);

// Command to test poems manually
bot.command("poem", async (ctx) => {
    const poem = getRandomPoem();

    if (!poem) {
        await ctx.reply("No poems available!");
        console.log("Could not find a random poem to send.");
        return;
    }

    await ctx.reply(poem.formatted);
    console.log(`Random poem sent with id: ${poem.id}, author: ${poem.author}, title: ${poem.title}`);
});

cron.schedule(
    "0 9 * * *", // 9 AM
    async () => {
        const poem = await getDailyPoem();

        if (!poem) {
            console.log("Could not find a daily poem to send.");
            return;
        }

        await bot.telegram.sendMessage(GROUP_ID, poem.formatted);
        console.log(`Daily poem sent at 9 AM Moscow time with id: ${poem.id}, author: ${poem.author}, title: ${poem.title}`);
    },
    { timezone: "Europe/Moscow" },
);

await bot.telegram.setMyCommands([{ command: "poem", description: "Get a random poem" }]);

bot.launch();
console.log("🚀 Bot started!");
