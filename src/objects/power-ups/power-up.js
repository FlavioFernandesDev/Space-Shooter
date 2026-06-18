import * as CONFIG from '../../config.js';

export const POWER_UP_TYPES = Object.freeze({
    SHIELD: 'shield',
    DOUBLE_SHOT: 'double_shot',
});

export class PowerUp extends Phaser.GameObjects.Container {
    #type;
    #circle;
    #label;

    constructor(scene, x, y) {
        super(scene, x, y, []);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(28, 28);
        this.body.setOffset(-14, -14);
        this.setDepth(1);

        this.#circle = scene.add.circle(0, 0, 14, 0x39d7ff, 0.9);
        this.#circle.setStrokeStyle(2, 0xffffff, 1);
        this.#label = scene.add.text(0, 0, 'S', {
            fontSize: '13px',
            color: '#00121a',
            fontStyle: 'bold',
            resolution: 2,
        }).setOrigin(0.5);

        this.add([this.#circle, this.#label]);
        this.disable();
    }

    get type() {
        return this.#type;
    }

    reset(type, x, y) {
        this.#type = type;
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.reset(x, y);
        this.body.setVelocity(0, CONFIG.POWER_UP_MOVEMENT_VERTICAL_VELOCITY);

        if (type === POWER_UP_TYPES.DOUBLE_SHOT) {
            this.#circle.setFillStyle(0xffd34d, 0.95);
            this.#label.setText('2x');
            return;
        }

        this.#circle.setFillStyle(0x39d7ff, 0.95);
        this.#label.setText('S');
    }

    collect() {
        this.disable();
    }

    disable() {
        this.setActive(false);
        this.setVisible(false);

        if (!this.body) {
            return;
        }

        this.body.enable = false;
        this.body.setVelocity(0, 0);
    }
}
