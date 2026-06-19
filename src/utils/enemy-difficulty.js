function getSafeLevel(level) {
    return Number.isFinite(level) && level > 1 ? Math.floor(level) : 1;
}

export function getEnemyVelocityForLevel(baseVelocity, level, levelMultiplier, maxMultiplier) {
    const safeLevel = getSafeLevel(level);
    const rawMultiplier = 1 + ((safeLevel - 1) * levelMultiplier);
    const multiplier = Math.min(rawMultiplier, maxMultiplier);
    const velocity = baseVelocity * multiplier;

    return Math.round(velocity * 100) / 100;
}

export function getEnemyFireIntervalForLevel(baseInterval, level, levelMultiplier, minInterval) {
    const safeLevel = getSafeLevel(level);
    const multiplier = 1 + ((safeLevel - 1) * levelMultiplier);
    const interval = baseInterval / multiplier;

    return Math.round(Math.max(interval, minInterval));
}
