export function getStoredBestScore(storage, storageKey) {
    if (!storage || !storageKey) {
        return 0;
    }

    try {
        const value = Number.parseInt(storage.getItem(storageKey), 10);
        return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
        return 0;
    }
}

export function saveBestScoreIfHigher(storage, storageKey, score) {
    const currentBest = getStoredBestScore(storage, storageKey);
    const safeScore = Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
    const nextBest = Math.max(currentBest, safeScore);

    if (!storage || !storageKey || nextBest === currentBest) {
        return nextBest;
    }

    try {
        storage.setItem(storageKey, nextBest.toString(10));
    } catch {
        return currentBest;
    }

    return nextBest;
}
