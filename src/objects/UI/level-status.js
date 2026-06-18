import { CUSTOM_EVENTS } from '../../components/events/event-bus-component.js';

export class LevelStatus {
    #scene;
    #labels;
    #levelText;
    #alertText;
    #level;

    constructor(scene, eventBusComponent) {
        this.#scene = scene;
        const lang = scene.registry.get('lang');
        this.#labels = scene.cache.json.get('translations')[lang];
        this.#level = 1;

        this.#levelText = scene.add.text(8, 12, this.#formatLevel(), {
            fontSize: '16px',
            color: '#39d7ff',
            fontStyle: 'bold',
            resolution: 2,
        });
        this.#levelText.setDepth(4);

        this.#alertText = scene.add.text(scene.scale.width / 2, 74, this.#labels.HUD_DIFFICULTY_UP, {
            fontSize: '20px',
            color: '#ffd34d',
            fontStyle: 'bold',
            resolution: 2,
        });
        this.#alertText.setOrigin(0.5);
        this.#alertText.setDepth(5);
        this.#alertText.setAlpha(0);

        eventBusComponent.on(CUSTOM_EVENTS.LEVEL_UP, (levelData) => {
            this.#level = levelData?.level || this.#level + 1;
            this.#levelText.setText(this.#formatLevel());
            this.#showAlert();
        });
    }

    #formatLevel() {
        return `${this.#labels.HUD_LEVEL} ${this.#level}`;
    }

    #showAlert() {
        this.#scene.tweens.killTweensOf(this.#alertText);
        this.#alertText.setText(this.#labels.HUD_DIFFICULTY_UP);
        this.#alertText.setPosition(this.#scene.scale.width / 2, 74);
        this.#alertText.setAlpha(1);
        this.#alertText.setScale(1);

        this.#scene.tweens.add({
            targets: this.#alertText,
            alpha: 0,
            y: 58,
            scale: 1.08,
            duration: 900,
            delay: 700,
            ease: 'Sine.easeOut',
        });
    }
}
