const BOSS_ATTACK_PATTERNS = Object.freeze([
    {
        name: 'single',
        cooldownMs: 2200,
        tint: 0xffd34d,
        bullets: Object.freeze([
            { offsetX: 0, velocityX: 0 },
        ]),
    },
    {
        name: 'cross',
        cooldownMs: 2400,
        tint: 0x39d7ff,
        bullets: Object.freeze([
            { offsetX: -30, velocityX: 45 },
            { offsetX: 30, velocityX: -45 },
        ]),
    },
    {
        name: 'spread',
        cooldownMs: 2600,
        tint: 0xff2f66,
        bullets: Object.freeze([
            { offsetX: -24, velocityX: -70 },
            { offsetX: 0, velocityX: 0 },
            { offsetX: 24, velocityX: 70 },
        ]),
    },
]);

const BOSS_MOVE_POSITIONS = Object.freeze([0.35, 0.65, 0.5, 0.25, 0.75]);

export function getBossAttackPattern(patternIndex) {
    return BOSS_ATTACK_PATTERNS[patternIndex % BOSS_ATTACK_PATTERNS.length];
}

export function getNextBossMoveTargetX(currentX, sceneWidth, moveIndex, margin) {
    const safeWidth = Math.max(sceneWidth, margin * 2);
    const minX = margin;
    const maxX = safeWidth - margin;
    const ratio = BOSS_MOVE_POSITIONS[moveIndex % BOSS_MOVE_POSITIONS.length];
    const targetX = Math.round(safeWidth * ratio);

    return Math.min(maxX, Math.max(minX, targetX));
}
