import * as CONFIG from '../../config.js';

export class BossRock extends Phaser.GameObjects.Container {
    #life;
    #maxLife;
    #rockShape;

    constructor(scene, x, y) {
        super(scene, x, y, []);

        this.#maxLife = CONFIG.ENEMY_BOSS_ROCK_HEALTH;
        this.#life = this.#maxLife;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(34, 28);
        this.body.setOffset(-17, -14);
        this.setDepth(2);

        this.#rockShape = scene.add.polygon(0, 0, [
            -17, -8,
            -8, -16,
            8, -13,
            18, -2,
            12, 14,
            -10, 13,
            -20, 2,
        ], 0x7a5a3a, 1);
        this.#rockShape.setStrokeStyle(2, 0xc49a6c, 1);
        this.add(this.#rockShape);

        this.disable();
    }

    reset(x, y) {
        this.#life = this.#maxLife;
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.reset(x, y);
        this.#updateVisual();
    }

    hit() {
        if (!this.active) {
            return false;
        }

        this.#life -= 1;

        if (this.#life <= 0) {
            this.disable();
            return true;
        }

        this.#updateVisual();
        return false;
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

    #updateVisual() {
        const lifePercent = this.#life / this.#maxLife;

        if (lifePercent <= 0.34) {
            this.#rockShape.setFillStyle(0x3f3023, 1);
            return;
        }

        if (lifePercent <= 0.67) {
            this.#rockShape.setFillStyle(0x5c422c, 1);
            return;
        }

        this.#rockShape.setFillStyle(0x7a5a3a, 1);
    }
}
