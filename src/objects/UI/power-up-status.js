import { CUSTOM_EVENTS } from '../../components/events/event-bus-component.js';

export class PowerUpStatus extends Phaser.GameObjects.Text {
    #labels;
    #activePowerUps;

    constructor(scene, eventBusComponent) {
        const lang = scene.registry.get('lang');
        const translations = scene.cache.json.get('translations');
        const labels = translations[lang];

        super(scene, scene.scale.width - 8, scene.scale.height - 34, '', {
            fontSize: '14px',
            color: '#ffffff',
            align: 'right',
            resolution: 2,
        });

        this.#labels = labels;
        this.#activePowerUps = new Map();

        this.scene.add.existing(this);
        this.setOrigin(1, 1);
        this.setDepth(4);

        eventBusComponent.on(CUSTOM_EVENTS.POWER_UP_TIMER_CHANGED, (powerUpData) => {
            if (!powerUpData.active || powerUpData.remainingMs <= 0) {
                this.#activePowerUps.delete(powerUpData.type);
            } else {
                this.#activePowerUps.set(powerUpData.type, powerUpData.remainingMs);
            }
            this.#updateText();
        });
    }

    #updateText() {
        const activePowerUps = Array.from(this.#activePowerUps.entries()).map(([type, remainingMs]) => {
            const label = type === 'shield' ? this.#labels.STATUS_SHIELD : this.#labels.STATUS_DOUBLE_SHOT;
            return `${label} ${Math.ceil(remainingMs / 1000)}s`;
        });

        this.setText(activePowerUps.join('\n'));
    }
}
