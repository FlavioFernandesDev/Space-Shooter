import { CUSTOM_EVENTS } from '../events/event-bus-component.js';
import { PowerUp, POWER_UP_TYPES } from '../../objects/power-ups/power-up.js';
import * as CONFIG from '../../config.js';

export class PowerUpSpawnerComponent {
    #scene;
    #spawnInterval;
    #spawnAt;
    #group;
    #disableSpawning;
    #nextTypeIndex;

    constructor(scene, eventBusComponent) {
        this.#scene = scene;
        this.#spawnInterval = CONFIG.POWER_UP_SPAWN_INTERVAL;
        this.#spawnAt = CONFIG.POWER_UP_SPAWN_START;
        this.#disableSpawning = false;
        this.#nextTypeIndex = 0;

        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
            classType: PowerUp,
            runChildUpdate: true,
        });

        this.#scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.#scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);

        this.#scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            if (this.#scene.physics && this.#scene.physics.world) {
                this.#scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);
            }
        }, this);

        eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
            this.#disableSpawning = true;
            this.#group.getChildren().forEach((powerUp) => powerUp.disable());
        });
    }

    get phaserGroup() {
        return this.#group;
    }

    update(ts, dt) {
        if (this.#disableSpawning) {
            return;
        }

        this.#spawnAt -= dt;

        if (this.#spawnAt > 0) {
            return;
        }

        const x = Phaser.Math.Between(35, this.#scene.scale.width - 35);
        const powerUp = this.#group.get(x, -20);

        if (powerUp) {
            powerUp.reset(this.#getNextType(), x, -20);
        }

        this.#spawnAt = this.#spawnInterval;
    }

    worldstep() {
        this.#group.getChildren().forEach((powerUp) => {
            if (!powerUp.active) {
                return;
            }

            if (powerUp.y > this.#scene.scale.height + 40) {
                powerUp.disable();
            }
        });
    }

    #getNextType() {
        const types = [POWER_UP_TYPES.SHIELD, POWER_UP_TYPES.DOUBLE_SHOT];
        const type = types[this.#nextTypeIndex];
        this.#nextTypeIndex = (this.#nextTypeIndex + 1) % types.length;
        return type;
    }
}
