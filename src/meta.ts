const META_FILE_PATH = "./data/meta.json";

interface Meta {
    lastSeenPoemIds: string[];
}

export const DEFAULT_META: Meta = {
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

export const saveMeta = (meta: Meta) => Bun.write(META_FILE_PATH, JSON.stringify(meta, null, 4));

export const resetMeta = () => Bun.write(META_FILE_PATH, JSON.stringify(DEFAULT_META, null, 4));
