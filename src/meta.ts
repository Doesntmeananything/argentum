const META_FILE_PATH = "./data/meta.json";

interface Meta {
    lastSeenPoemIds: string[];
}

const DEFAULT_META: Readonly<Meta> = {
    lastSeenPoemIds: [],
};

export const loadMeta = async (): Promise<Meta> => {
    try {
        const file = Bun.file(META_FILE_PATH);

        const doesExist = await file.exists();
        if (!doesExist) return DEFAULT_META;

        return file.json();
    } catch (error) {
        return DEFAULT_META;
    }
};

export const saveMeta = async (meta: Meta) => {
    await Bun.write(META_FILE_PATH, JSON.stringify(meta, null, 4));

    return meta;
};

export const resetMeta = async () => {
    const defaultMeta: Meta = {
        lastSeenPoemIds: [],
    };

    await Bun.write(META_FILE_PATH, JSON.stringify(defaultMeta, null, 4));

    return defaultMeta;
};
