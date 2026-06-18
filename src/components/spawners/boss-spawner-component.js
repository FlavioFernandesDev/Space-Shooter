import { CUSTOM_EVENTS } from '../events/event-bus-component.js';
import { BossEnemy } from '../../objects/enemies/boss-enemy.js';
import * as CONFIG from '../../config.js';

export class BossSpawnerComponent {
    #scene;
    #eventBusComponent;
    #group;
    #boss;
    #nextBossScore;
    #disableSpawning;

    constructor(scene, eventBusComponent) {
        this.#scene = scene;
        this.#eventBusComponent = eventBusComponent;
        this.#nextBossScore = CONFIG.ENEMY_BOSS_FIRST_SCORE;
        this.#disableSpawning = false;

        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
            runChildUpdate: true,
        });

        this.#boss = new BossEnemy(this.#scene, this.#scene.scale.width / 2, 82, this.#eventBusComponent);
        this.#group.add(this.#boss);

        eventBusComponent.on(CUSTOM_EVENTS.LEVEL_UP, (levelData) => {
            if (this.#disableSpawning || !levelData) {
                return;
            }

            if (levelData.score < this.#nextBossScore) {
                return;
            }

            this.#nextBossScore += CONFIG.ENEMY_BOSS_SCORE_INTERVAL;
            this.#spawnBoss();
        });

        eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
            this.#disableSpawning = true;
            this.#boss.disable();
        });
    }

    get phaserGroup() {
        return this.#group;
    }

    get rockGroup() {
        return this.#boss.rockGroup;
    }

    get weaponGameObjectGroup() {
        return this.#boss.weaponGameObjectGroup;
    }

    get weaponComponent() {
        return this.#boss.weaponComponent;
    }

    #spawnBoss() {
        if (this.#boss.active) {
            return;
        }

        this.#eventBusComponent.emit(CUSTOM_EVENTS.BOSS_PHASE_STARTED);
        this.#boss.reset(this.#scene.scale.width / 2, 82);
    }
}
