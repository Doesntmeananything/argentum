import { bold, fmt, italic, join, type FmtString } from "telegraf/format";

import { poems } from "../data/poems.json";

import type { PoemsCollection } from "./poem";
import { loadMeta, resetMeta, saveMeta } from "./meta";

type JsonPoem = PoemsCollection["poems"][number];

interface DailyPoem {
    id: string;
    author: string;
    title: string;
    formatted: FmtString<"fmt">;
}

const MAX_POEM_HISTORY = 30;
/**
 * A special id that is always guaranteed to be present in the poem data set.
 */
const DEFAULT_POEM_ID = "1";

export const getDailyPoem = async (): Promise<DailyPoem | undefined> => {
    let meta = await loadMeta();

    const availablePoems = poems.filter((poem) => !meta.lastSeenPoemIds.includes(poem.id));

    // Reset history if there are no fresh poems
    if (availablePoems.length === 0) {
        meta = await resetMeta();
        const dailyPoem = poems.find((poem) => poem.id === DEFAULT_POEM_ID);

        if (!dailyPoem) return;

        meta.lastSeenPoemIds.push(dailyPoem.id);
        await saveMeta(meta);

        return {
            id: dailyPoem.id,
            author: dailyPoem.author.name,
            title: dailyPoem.title,
            formatted: formatPoem(dailyPoem),
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

const formatPoem = (poem: JsonPoem) => {
    if (poem.dedicatedTo) {
        return fmt`
${bold`${poem.author.name}`}

${bold`${poem.title}`}

${italic`${poem.dedicatedTo}`}

${poem.text}

${italic`${poem.date ?? ""}`}
${italic`${poem.location ?? ""}`}
`;
    }

    return fmt`
${bold`${poem.author.name}`}

${bold`${poem.title}`}

${poem.text}

${italic`${poem.date ?? ""}`}
${italic`${poem.location ?? ""}`}
`;
};
