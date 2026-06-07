import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js'; 
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { Player } from '../objects/player.js';
import { EventBusComponent, CUSTOM_EVENTS } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { Score } from '../objects/UI/score.js';
import { Lives } from '../objects/UI/lives.js';
import { AudioManager } from '../objects/audio-manager.js';
import * as CONFIG from '../config.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.pack('assets_pack', 'assets/data/assets.json');
    }

    create() {

        this.add.sprite(0,0,'bg1',0).setOrigin(0,1).setAlpha(0.7).setAngle(90).setScale(1, 1.25).play('bg1');
        this.add.sprite(0,0,'bg2',0).setOrigin(0,1).setAlpha(0.7).setAngle(90).setScale(1, 1.25).play('bg2');
        this.add.sprite(0,0,'bg3',0).setOrigin(0,1).setAlpha(0.7).setAngle(90).setScale(1, 1.25).play('bg3');
        
        const CUSTOM_EVENTS = { ENEMY_INIT: 'enemy-init' };
        const eventBusComponent = new EventBusComponent();
        const player = new Player(this, eventBusComponent);

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

        new EnemyDestroyedComponent(this, eventBusComponent);




        //const enemy = new ScoutEnemy(this, this.scale.width / 2, 20);
        //const enemy = new FighterEnemy(this, this.scale.width / 2, 20);
        

this.physics.add.overlap(player, scoutSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
    if(!playerGameObject.active || !enemyGameObject.active){
        return;
    }

    playerGameObject.colliderComponent.collideWithEnemyShip();
    enemyGameObject.colliderComponent.collideWithPlayerShip();
});

this.physics.add.overlap(player, fighterSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
    if(!playerGameObject.active || !enemyGameObject.active){
        return;
    }

    playerGameObject.colliderComponent.collideWithEnemyShip();
    enemyGameObject.colliderComponent.collideWithPlayerShip();
});

eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
    if(gameObject.constructor.name !== 'FighterEnemy'){
        return;
    }

    this.physics.add.overlap(player, gameObject.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
        if(!playerGameObject.active || !projectileGameObject.active){
        return;
    }

    gameObject.weaponComponent.destroyBullet(projectileGameObject);
    playerGameObject.colliderComponent.collideWithEnemyProjectile();
    });
});




this.physics.add.overlap(scoutSpawner.phaserGroup, player.weaponGameObjectGroup, (enemyGameObject, projectileGameObject) => {
      if(!enemyGameObject.active || !projectileGameObject.active){
        return;
    }

    player.weaponComponent.destroyBullet(projectileGameObject);
    enemyGameObject.colliderComponent.collideWithPlayerProjectile();
});

this.physics.add.overlap(fighterSpawner.phaserGroup, player.weaponGameObjectGroup, (enemyGameObject, projectileGameObject) => {
      if(!enemyGameObject.active || !projectileGameObject.active){
        return;
    }

    player.weaponComponent.destroyBullet(projectileGameObject);
    enemyGameObject.colliderComponent.collideWithPlayerProjectile();
});

new Score(this, eventBusComponent);
new Lives(this, eventBusComponent);
new AudioManager(this, eventBusComponent);


}
    
}

