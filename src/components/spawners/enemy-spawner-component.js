import { EventBusComponent, CUSTOM_EVENTS } from '../events/event-bus-component.js';
import * as CONFIG from '../../config.js';

export class EnemySpawnerComponent {
    #scene;
    #spawnInterval;
    #spawnAt;
    #group;
    #eventBusComponent;
    #disableSpawning;
    #pauseSpawning;
    #minSpawnInterval;
    #difficultyLevel;

    constructor(scene, enemyClass, spawnConfig, eventBusComponent) {
        this.#eventBusComponent = eventBusComponent;
        this.#scene = scene;
        this.#group = this.#scene.add.group({
            classType: enemyClass,
            runChildUpdate: true,
            createCallback: (enemy) => {
                // cada inimigo recebe o mesmo event bus
                enemy.init(this.#eventBusComponent);
            },
        });

        this.#spawnInterval = spawnConfig.spawnInterval;
        this.#spawnAt = spawnConfig.spawnAt;
        this.#disableSpawning = false;
        this.#pauseSpawning = false;
        this.#minSpawnInterval = spawnConfig.minSpawnInterval || 600;
        this.#difficultyLevel = 1;

        // o update controla quando aparece o proximo inimigo
        this.#scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.#scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);
        
        this.#scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN, 
            () => {
                // ao sair da cena removemos os listeners
                this.#scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
                if (this.#scene.physics && this.#scene.physics.world) {
                    this.#scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);      
                }
            }, 
            this
        );
        
        eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
            this.#disableSpawning = true;
        });

        // quando sobe de nivel, os inimigos aparecem mais depressa
        eventBusComponent.on(CUSTOM_EVENTS.LEVEL_UP, (levelData) => {
            this.#difficultyLevel = levelData?.level || this.#difficultyLevel + 1;
            this.#spawnInterval = Math.max(this.#minSpawnInterval, this.#spawnInterval * CONFIG.DIFFICULTY_SPAWN_INTERVAL_MULTIPLIER);
            this.#applyDifficultyToEnemies();
        });

        eventBusComponent.on(CUSTOM_EVENTS.BOSS_PHASE_STARTED, () => {
            // durante o boss paramos os inimigos normais
            this.#pauseSpawning = true;
            this.#clearActiveEnemies();
        });

        eventBusComponent.on(CUSTOM_EVENTS.BOSS_PHASE_ENDED, () => {
            this.#pauseSpawning = false;
            this.#spawnAt = 1200;
        });
    }

    get phaserGroup() {
        return this.#group;
    }

    update(ts, dt) {
        if (this.#disableSpawning || this.#pauseSpawning) {
            return;
        }
        // conta o tempo ate ao proximo spawn
        this.#spawnAt -= dt;

        if (this.#spawnAt > 0) {
            return;
        }
    
        const x = Phaser.Math.Between(30, this.#scene.scale.width - 30);
        
        // reutiliza um inimigo que esteja livre
        const enemy = this.#group.get(); 

        if (enemy) {
            enemy.setPosition(x, -20);
            if (enemy.body) {
                enemy.body.reset(x, -20);
            }
            enemy.reset();
            this.#applyDifficulty(enemy);
        }
        
        this.#spawnAt = this.#spawnInterval;
    }

    worldstep(delta) {
        // tira inimigos que ja passaram o ecra
        this.#group.getChildren().forEach((enemy) => {
            if (!enemy.active) {
                return;
            }
            
            if (enemy.y > this.#scene.scale.height + 50) {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
    }

    #clearActiveEnemies() {
        // limpa inimigos e balas antes do boss entrar
        this.#group.getChildren().forEach((enemy) => {
            enemy.setActive(false);
            enemy.setVisible(false);

            if (enemy.body) {
                enemy.body.setVelocity(0, 0);
            }

            if (enemy.weaponGameObjectGroup) {
                enemy.weaponGameObjectGroup.getChildren().forEach((bullet) => {
                    if (bullet.active) {
                        bullet.disableBody(true, true);
                    }
                });
            }
        });
    }

    #applyDifficultyToEnemies() {
        this.#group.getChildren().forEach((enemy) => {
            this.#applyDifficulty(enemy);
        });
    }

    #applyDifficulty(enemy) {
        // so aplica se o inimigo souber mudar dificuldade
        if (enemy && typeof enemy.setDifficultyLevel === 'function') {
            enemy.setDifficultyLevel(this.#difficultyLevel);
        }
    }
}
