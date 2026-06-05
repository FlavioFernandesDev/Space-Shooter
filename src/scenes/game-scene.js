import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js'; 
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { Player } from '../objects/player.js';
import { EventBusComponent } from '../components/events/event-bus-component.js';
import * as CONFIG from '../config.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.pack('assets_pack', 'assets/data/assets.json');
    }

    create() {
        const CUSTOM_EVENTS = { ENEMY_INIT: 'enemy-init' };
        const eventBusComponent = new EventBusComponent();
        const player = new Player(this);

        const scoutSpawner = new EnemySpawnerComponent(this,
            ScoutEnemy,
            {
                spawnInterval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
                spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
            },
            eventBusComponent
        );

        const fighterSpawner = new EnemySpawnerComponent(this,
            FighterEnemy,
            {
                spawnInterval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
                spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
            },
            eventBusComponent
        );




        //const enemy = new ScoutEnemy(this, this.scale.width / 2, 20);
        //const enemy = new FighterEnemy(this, this.scale.width / 2, 20);
        

this.physics.add.overlap(player, scoutSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
    playerGameObject.colliderComponent.collideWithEnemyShip();
    enemyGameObject.colliderComponent.collideWithPlayerShip();
});

this.physics.add.overlap(player, fighterSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
    playerGameObject.colliderComponent.collideWithEnemyShip();
    enemyGameObject.colliderComponent.collideWithPlayerShip();
});

eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
    if(gameObject.constructor.name !== 'FighterEnemy'){
        return;
    }

    this.physics.add.overlap(player, gameObject.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
    gameObject.weaponComponent.destroyBullet(projectileGameObject);
    playerGameObject.colliderComponent.collideWithEnemyProjectile();
    });
});




this.physics.add.overlap(scoutSpawner.phaserGroup, player.weaponGameObjectGroup, (enemyGameObject, projectileGameObject) => {
    player.weaponComponent.destroyBullet(projectileGameObject);
    enemyGameObject.colliderComponent.collideWithPlayerProjectile();
});

this.physics.add.overlap(fighterSpawner.phaserGroup, player.weaponGameObjectGroup, (enemyGameObject, projectileGameObject) => {
    player.weaponComponent.destroyBullet(projectileGameObject);
    enemyGameObject.colliderComponent.collideWithPlayerProjectile();
});

}
    
}

