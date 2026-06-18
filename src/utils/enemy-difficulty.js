export function getEnemyVelocityForLevel(baseVelocity, level, levelMultiplier, maxMultiplier) {
    const safeLevel = Number.isFinite(level) && level > 1 ? Math.floor(level) : 1;
    const rawMultiplier = 1 + ((safeLevel - 1) * levelMultiplier);
    const multiplier = Math.min(rawMultiplier, maxMultiplier);
    const velocity = baseVelocity * multiplier;

    return Math.round(velocity * 100) / 100;
}
