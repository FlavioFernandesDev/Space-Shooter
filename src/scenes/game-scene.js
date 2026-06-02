import { FighterEnemy } from '../objects/enemies/fighter-enemy.js'; 
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { Player } from '../objects/player.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.pack('assets_pack', 'assets/data/assets.json');
    }

    create() {
        const player = new Player(this);
        //const enemy = new ScoutEnemy(this, this.scale.width / 2, 20);
        const enemy = new FighterEnemy(this, this.scale.width / 2, 20);

        this.physics.add.overlap(player, enemy, (playerGameObject, enemyGameObject) => {
            playerGameObject.colliderComponent.collideWithEnemyShip();
            enemyGameObject.colliderComponent.collideWithPlayerShip();
        });
        this.physics.add.overlap(player, enemy.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
            enemy.weaponComponent.destroyBullet(projectileGameObject);
            playerGameObject.colliderComponent.collideWithEnemyProjectile();
        });
        this.physics.add.overlap(enemy, player.weaponGameObjectGroup, (enemyGameObject, projectileGameObject) => {
            player.weaponComponent.destroyBullet(projectileGameObject);
            enemyGameObject.colliderComponent.collideWithPlayerProjectile();
        });
    }
    
}

