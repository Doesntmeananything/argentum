import { bold, fmt, italic, type FmtString } from "telegraf/format";

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
