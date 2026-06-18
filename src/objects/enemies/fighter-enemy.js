import { ColliderComponent } from '../../components/collider/collider-component.js';
import { HealthComponent } from '../../components/health/health-component.js';
import { BotFighterInputComponent } from '../../components/inputs/bot-fighter-input-component.js';
import { VerticalMovementComponent } from '../../components/movements/vertical-movement-component.js';
import { WeaponComponent } from '../../components/weapon/weapon-component.js';
import { CUSTOM_EVENTS } from '../../components/events/event-bus-component.js';
import { getEnemyVelocityForLevel } from '../../utils/enemy-difficulty.js';
import * as CONFIG from '../../config.js';

export class FighterEnemy extends Phaser.GameObjects.Container {
    #isInitialized;
    #inputComponent;
    #weaponComponent;
    #verticalMovementComponent;
    #healthComponent;
    #colliderComponent;
    #eventBusComponent;
    #shipSprite;
    #shipEngineSprite;

    constructor(scene, x, y) {
        super(scene, x, y, []);

        this.#isInitialized = false;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(24, 24);
        this.body.setOffset(-12, -12);
        

        this.#shipSprite = scene.make.sprite({ x: 0, y: 0, key: 'fighter', frame: 0, add: false });
        this.#shipEngineSprite = scene.make.sprite({ x: 0, y: 0, key: 'fighter_engine', add: false }).setFlipY(true);
        this.#shipEngineSprite.play('fighter_engine');
        this.add([this.#shipEngineSprite, this.#shipSprite]);
        

       

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => { 
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);      
        }, this);
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }

    get healthComponent() {
        return this.#healthComponent;
    }

    get weaponGameObjectGroup() {
        return this.#weaponComponent.bulletGroup;
    }

    get weaponComponent() {
        return this.#weaponComponent;
    }

    get shipAssetKey() {
        return 'fighter';
    }

    get shipDestroyedAnimationKey() {
        return 'fighter_destroy';
    }

    init(eventBusComponent) {

        this.#eventBusComponent = eventBusComponent;

        this.#inputComponent = new BotFighterInputComponent(this);

        this.#verticalMovementComponent = new VerticalMovementComponent(this, this.#inputComponent, CONFIG.ENEMY_FIGHTER_MOVEMENT_VERTICAL_VELOCITY);
        
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            speed: CONFIG.ENEMY_FIGHTER_BULLET_SPEED,
            interval: CONFIG.ENEMY_FIGHTER_BULLET_INTERVAL,
            lifespan: CONFIG.ENEMY_FIGHTER_BULLET_LIFESPAN,
            maxCount: CONFIG.ENEMY_FIGHTER_BULLETS_MAX_COUNT,
            yOffset: 10,
            flipY: true, 
        }, this.#eventBusComponent);
       
        this.#healthComponent = new HealthComponent(CONFIG.ENEMY_FIGHTER_HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
        this.#isInitialized = true;


    }

    reset(){
        this.setActive(true);
        this.setVisible(true);
        this.#healthComponent.reset();
        this.#verticalMovementComponent.reset();
    }

    setDifficultyLevel(level) {
        if (!this.#verticalMovementComponent) {
            return;
        }

        this.#verticalMovementComponent.velocity = getEnemyVelocityForLevel(
            CONFIG.ENEMY_FIGHTER_MOVEMENT_VERTICAL_VELOCITY,
            level,
            CONFIG.DIFFICULTY_ENEMY_SPEED_LEVEL_MULTIPLIER,
            CONFIG.DIFFICULTY_ENEMY_SPEED_MAX_MULTIPLIER
        );
    }

    update(ts, dt) {
        if(!this.#isInitialized){
            return;
        }
        
        if (!this.active){
            return;
        }

        if (this.#healthComponent.isDead) {
            this.setActive(false);
            this.setVisible(false);
            this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
        }
        
        this.#inputComponent.update();
        this.#verticalMovementComponent.update();
        this.#weaponComponent.update(dt);
    }
}
