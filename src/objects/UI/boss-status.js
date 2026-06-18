import { CUSTOM_EVENTS } from '../../components/events/event-bus-component.js';

export class BossStatus extends Phaser.GameObjects.Container {
    #labels;
    #healthFill;
    #alertText;

    constructor(scene, eventBusComponent) {
        super(scene, 0, 0, []);

        const lang = scene.registry.get('lang');
        this.#labels = scene.cache.json.get('translations')[lang];
        const centerX = scene.scale.width / 2;
        const barWidth = 190;

        const label = scene.add.text(centerX, 36, this.#labels.HUD_BOSS, {
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold',
            resolution: 2,
        }).setOrigin(0.5);

        const healthBackground = scene.add.rectangle(centerX, 52, barWidth, 9, 0x250b18, 0.9);
        healthBackground.setStrokeStyle(1, 0xffffff, 0.8);

        this.#healthFill = scene.add.rectangle(centerX - barWidth / 2, 52, barWidth, 5, 0xff2f66, 1);
        this.#healthFill.setOrigin(0, 0.5);

        this.#alertText = scene.add.text(centerX, 92, this.#labels.HUD_BOSS_ALERT, {
            fontSize: '24px',
            color: '#ffd34d',
            fontStyle: 'bold',
            resolution: 2,
        }).setOrigin(0.5);
        this.#alertText.setAlpha(0);

        this.add([label, healthBackground, this.#healthFill, this.#alertText]);
        this.setDepth(6);
        this.setVisible(false);
        scene.add.existing(this);

        eventBusComponent.on(CUSTOM_EVENTS.BOSS_PHASE_STARTED, () => {
            this.#healthFill.setScale(1, 1);
            this.setVisible(true);
            this.#showAlert();
        });

        eventBusComponent.on(CUSTOM_EVENTS.BOSS_HEALTH_CHANGED, (healthData) => {
            if (!healthData || healthData.max <= 0) {
                return;
            }

            this.setVisible(true);
            const healthPercent = Phaser.Math.Clamp(healthData.current / healthData.max, 0, 1);
            this.#healthFill.setScale(healthPercent, 1);
        });

        eventBusComponent.on(CUSTOM_EVENTS.BOSS_PHASE_ENDED, () => {
            this.setVisible(false);
        });
    }

    #showAlert() {
        this.scene.tweens.killTweensOf(this.#alertText);
        this.#alertText.setText(this.#labels.HUD_BOSS_ALERT);
        this.#alertText.setAlpha(1);
        this.#alertText.setScale(1);

        this.scene.tweens.add({
            targets: this.#alertText,
            alpha: 0,
            scale: 1.15,
            duration: 850,
            delay: 750,
            ease: 'Sine.easeOut',
        });
    }
}
