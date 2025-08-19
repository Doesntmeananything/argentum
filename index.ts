import cron from "node-cron";
import { Telegraf } from "telegraf";
import { bold, fmt } from "telegraf/format";

interface Poem {
    author: string;
    text: string;
}

const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');
if (!GROUP_ID) throw new Error('"GROUP_ID" env var is required!');

const bot = new Telegraf(BOT_TOKEN);

const poems: Poem[] = [
    {
        author: "Анна Ахматова",
        text: `Мне голос был. Он звал утешно,\nОн говорил: «Иди сюда...»`,
    },
    {
        author: "Осип Мандельштам",
        text: `Бессонница. Гомер. Тугие паруса.\nЯ список кораблей прочел до середины...`,
    },
    {
        author: "Александр Блок",
        text: `Ночь, улица, фонарь, аптека,\nБессмысленный и тусклый свет...`,
    },
];

function getDailyPoem() {
    return poems[Math.floor(Math.random() * poems.length)];
}

function buildPoemString(poem: Poem) {
    const poemString = fmt`

${bold`${poem.author}`}

${poem.text}

`;

    return poemString;
}

// Command to test manually
bot.command("poem", async (ctx) => {
    const poem = getDailyPoem();
    if (!poem) {
        await ctx.reply("No poem available!");
        return;
    }

    await ctx.reply(buildPoemString(poem));
});

cron.schedule(
    "0 9 * * *",
    async () => {
        const poem = getDailyPoem();
        if (!poem) return;

        await bot.telegram.sendMessage(GROUP_ID, buildPoemString(poem));
        console.log("Daily poem sent at 9 AM Moscow time");
    },
    { timezone: "Europe/Moscow" }
);

bot.launch();
console.log("🚀 Bot started!");
