import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import { BossSpawnerComponent } from '../components/spawners/boss-spawner-component.js';
import { PowerUpSpawnerComponent } from '../components/spawners/power-up-spawner-component.js';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js'; 
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { Player } from '../objects/player.js';
import { EventBusComponent, CUSTOM_EVENTS } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { Score } from '../objects/UI/score.js';
import { Lives } from '../objects/UI/lives.js';
import { PowerUpStatus } from '../objects/UI/power-up-status.js';
import { LevelStatus } from '../objects/UI/level-status.js';
import { BossStatus } from '../objects/UI/boss-status.js';
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
        
        
        // o event bus passa avisos entre as partes do jogo
        const eventBusComponent = new EventBusComponent();
        const player = new Player(this, eventBusComponent);

        const scoutSpawner = new EnemySpawnerComponent(this,
            ScoutEnemy,
            {
                spawnInterval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
                spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
                minSpawnInterval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_MIN_INTERVAL,
            },
            eventBusComponent
        );

        const fighterSpawner = new EnemySpawnerComponent(this,
            FighterEnemy,
            {
                spawnInterval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
                spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
                minSpawnInterval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_MIN_INTERVAL,
            },
            eventBusComponent
        );

        const bossSpawner = new BossSpawnerComponent(this, eventBusComponent);
        const powerUpSpawner = new PowerUpSpawnerComponent(this, eventBusComponent);

        new EnemyDestroyedComponent(this, eventBusComponent);

        // evita repetir a mesma colisao para scouts e fighters
        const addPlayerEnemyCollision = (enemyGroup) => {
            this.physics.add.overlap(player, enemyGroup, (playerGameObject, enemyGameObject) => {
                if (!playerGameObject.active || !enemyGameObject.active) {
                    return;
                }

                playerGameObject.colliderComponent.collideWithEnemyShip();
                enemyGameObject.colliderComponent.collideWithPlayerShip();
            });
        };

        // colisao dos tiros do jogador com cada grupo de inimigos
        const addPlayerProjectileCollision = (enemyGroup) => {
            this.physics.add.overlap(enemyGroup, player.weaponGameObjectGroup, (enemyGameObject, projectileGameObject) => {
                if (!enemyGameObject.active || !projectileGameObject.active) {
                    return;
                }

                player.weaponComponent.destroyBullet(projectileGameObject);
                enemyGameObject.colliderComponent.collideWithPlayerProjectile();
            });
        };

        addPlayerEnemyCollision(scoutSpawner.phaserGroup);
        addPlayerEnemyCollision(fighterSpawner.phaserGroup);

        // quando apanha um power-up, o jogador trata do efeito pelo evento
        this.physics.add.overlap(player, powerUpSpawner.phaserGroup, (playerGameObject, powerUpGameObject) => {
            if (!playerGameObject.active || !powerUpGameObject.active) {
                return;
            }

            eventBusComponent.emit(CUSTOM_EVENTS.POWER_UP_COLLECTED, powerUpGameObject.type);
            powerUpGameObject.collect();
        });

        // cada inimigo com arma ganha colisao dos tiros com o jogador
        eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
            if (!gameObject.weaponGameObjectGroup || !gameObject.weaponComponent) {
                return;
            }

            this.physics.add.overlap(player, gameObject.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
                if (!playerGameObject.active || !projectileGameObject.active) {
                    return;
                }

                gameObject.weaponComponent.destroyBullet(projectileGameObject);
                playerGameObject.colliderComponent.collideWithEnemyProjectile();
            });
        });

        addPlayerProjectileCollision(scoutSpawner.phaserGroup);
        addPlayerProjectileCollision(fighterSpawner.phaserGroup);

        // primeiro partimos as rochas que protegem o boss
        this.physics.add.overlap(bossSpawner.rockGroup, player.weaponGameObjectGroup, (rockGameObject, projectileGameObject) => {
            if (!rockGameObject.active || !projectileGameObject.active) {
                return;
            }

            player.weaponComponent.destroyBullet(projectileGameObject);
            rockGameObject.hit();
        });

        this.physics.add.overlap(bossSpawner.phaserGroup, player.weaponGameObjectGroup, (bossGameObject, projectileGameObject) => {
            if (!bossGameObject.active || !projectileGameObject.active) {
                return;
            }

            player.weaponComponent.destroyBullet(projectileGameObject);
            bossGameObject.hitByPlayerProjectile();
        });

        this.physics.add.overlap(player, bossSpawner.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
            if (!playerGameObject.active || !projectileGameObject.active) {
                return;
            }

            bossSpawner.weaponComponent.destroyBullet(projectileGameObject);
            playerGameObject.colliderComponent.collideWithEnemyProjectile();
        });

        // o HUD fica a ouvir os eventos do jogo
        new Score(this, eventBusComponent);
        new Lives(this, eventBusComponent);
        new PowerUpStatus(this, eventBusComponent);
        new LevelStatus(this, eventBusComponent);
        new BossStatus(this, eventBusComponent);
        new AudioManager(this, eventBusComponent);

        eventBusComponent.on(CUSTOM_EVENTS.SHIP_HIT, () => {
            this.cameras.main.shake(120, 0.006);
        });

        eventBusComponent.on(CUSTOM_EVENTS.PLAYER_DESTROYED, () => {
            this.cameras.main.shake(180, 0.01);
        });

        eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
            this.scene.pause(); // Congela as naves e os tiros
            this.scene.launch('GameOverScene'); // Abre o ecrã transparente por cima
        });

        this.input.keyboard.on('keydown-P', () => {
            this.scene.pause();
            this.scene.launch('PauseScene');
        });

    }
    
}
