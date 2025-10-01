import { bold, fmt, italic, type FmtString } from "telegraf/format";

import { poems } from "../data/poems.json";

import type { PoemsCollection } from "./poems-json";
import { loadMeta, resetMeta, saveMeta } from "./meta";

type JsonPoem = PoemsCollection["poems"][number];

interface DailyPoem {
    id: string;
    author: string;
    title: string;
    formatted: FmtString<"fmt">;
}

// A window of unique poems, which allows duplicates only outside of this number
const MAX_POEM_HISTORY = 180;

export const getDailyPoem = async (): Promise<DailyPoem | undefined> => {
    let meta = await loadMeta();

    const availablePoems = poems.filter((poem) => !meta.lastSeenPoemIds.includes(poem.id));

    // Reset history if there are no fresh poems
    if (availablePoems.length === 0) {
        meta = await resetMeta();

        // This first poem is guaranteed to exist by the dataset,
        // and it is safe to start a new cycle with it
        const firstPoem = poems.at(0);

        if (!firstPoem) return;

        meta.lastSeenPoemIds.push(firstPoem.id);
        await saveMeta(meta);

        return {
            id: firstPoem.id,
            author: firstPoem.author.name,
            title: firstPoem.title,
            formatted: formatPoem(firstPoem),
        };
    }

    const dailyPoem = availablePoems[Math.floor(Math.random() * availablePoems.length)];

    if (!dailyPoem) return;

    meta.lastSeenPoemIds.push(dailyPoem.id);
    if (meta.lastSeenPoemIds.length > MAX_POEM_HISTORY) {
        meta.lastSeenPoemIds.shift();
    }
    await saveMeta(meta);

    return {
        id: dailyPoem.id,
        author: dailyPoem.author.name,
        title: dailyPoem.title,
        formatted: formatPoem(dailyPoem),
    };
};

export const getRandomPoem = (): DailyPoem | undefined => {
    const randomPoem = poems.at(Math.floor(Math.random() * poems.length));

    if (!randomPoem) return;

    return {
        id: randomPoem.id,
        author: randomPoem.author.name,
        title: randomPoem.title,
        formatted: formatPoem(randomPoem),
    };
};

const formatPoem = (poem: JsonPoem) => {
    const epigraph = poem.epigraph?.join("\n");
    const footer = poem.footer?.join("\n") ?? "";

    if (epigraph) {
        return fmt`
${bold`${poem.author.name}`}

${bold`${poem.title}`}

${italic`${epigraph}`}

${poem.text}

${italic`${footer}`}
`;
    }

    return fmt`
${bold`${poem.author.name}`}

${bold`${poem.title}`}

${poem.text}

${italic`${footer}`}
`;
};
