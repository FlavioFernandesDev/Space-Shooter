import { EventBusComponent, CUSTOM_EVENTS } from '../events/event-bus-component.js';

export class EnemySpawnerComponent {
    #scene;
    #spawnInterval;
    #spawnAt;
    #group;
    #eventBusComponent;
    #disableSpawning;

    constructor(scene, enemyClass, spawnConfig,eventBusComponent) {
        this.#eventBusComponent = eventBusComponent;
        this.#scene = scene;
        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
            classType: enemyClass,
            runChildUpdate: true,
            createCallback: (enemy) => {
                console.log(enemy);
                enemy.init(this.#eventBusComponent);
            },
        });

        this.#spawnInterval = spawnConfig.spawnInterval;
        this.#spawnAt = spawnConfig.spawnAt;
        this.#disableSpawning = false;

        this.#scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.#scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);
        this.#scene.events.once(
            Phaser.Scenes.Events.DESTROY, 
            () => {
            this.#scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            this.#scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);      
        }, 
        this
    );
    eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
        this.#disableSpawning = true;
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
    
    const x = Phaser.Math.Between(30, this.#scene.scale.width - 30);
    const enemy = this.#group.get(x, -20); 

    if (enemy.init) {
            enemy.init(this.#eventBusComponent);
        }
        
    enemy.reset();
    this.#spawnAt = this.#spawnInterval;

    }

    worldstep(delta) {
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
}