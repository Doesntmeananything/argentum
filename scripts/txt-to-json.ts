import { readFile, writeFile } from "node:fs/promises";
import { type UUID, randomUUID } from "node:crypto";
import { resolve } from "path";

import type { PoemsCollection } from "../src/poem";

type PoemsFile = PoemsCollection;
type JsonPoem = PoemsCollection["poems"][number];

const AUTHOR_IDS: Record<string, UUID> = {
    "Андрей Белый": "a32a5d55-95fd-4d47-8e9c-5b50277f3798",
};

function poemToJson(
    poem: string,
    {
        authorName,
        title,
        date,
        location,
        dedicatedTo,
    }: {
        authorName: string;
        title: string;
        date?: string;
        location?: string;
        dedicatedTo?: string;
    },
): JsonPoem {
    return {
        id: randomUUID(),
        author: {
            id: AUTHOR_IDS[authorName] ?? randomUUID(),
            name: authorName,
        },
        title,
        text: poem.trim(),
        ...(date ? { date } : {}),
        ...(location ? { location } : {}),
        ...(dedicatedTo ? { dedicatedTo } : {}),
    };
}

async function main() {
    const [inputFile, authorName, title, date, location, dedicatedTo] = Bun.argv.slice(2);

    if (!inputFile || !authorName || !title) {
        console.error("Usage: bun run poem-to-json.ts <poem.txt> <authorName> <title> [date] [location] [dedicatedTo]");
        process.exit(1);
    }

    const filePath = resolve(inputFile);
    const poemText = await readFile(filePath, "utf8");

    const jsonPoem = poemToJson(poemText, {
        authorName,
        title,
        date,
        location,
        dedicatedTo,
    });

    const poemsFilePath = resolve("data/poems.json");
    let poemsFile: PoemsFile;

    try {
        const existing = await readFile(poemsFilePath, "utf8");
        poemsFile = JSON.parse(existing);
        if (!Array.isArray(poemsFile.poems)) {
            throw new TypeError("Invalid poems.json format: missing 'poems' array");
        }
    } catch {
        // If file doesn't exist or is invalid, start fresh
        poemsFile = { poems: [] };
    }

    poemsFile.poems.push(jsonPoem);

    await writeFile(poemsFilePath, JSON.stringify(poemsFile, null, 4), "utf8");

    console.log(`✅ Poem added to ${poemsFilePath}`);
}

main();
