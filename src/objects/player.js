import { ColliderComponent } from '../components/collider/collider-component.js';
import { CUSTOM_EVENTS } from '../components/events/event-bus-component.js';
import { HealthComponent } from '../components/health/health-component.js';
import { KeyboardInputComponent } from '../components/inputs/keyboard-input-component.js';
import { HorizontalMovementComponent } from '../components/movements/horizontal-movement-component.js';
import { ShieldComponent } from '../components/power-ups/shield-component.js';
import { WeaponComponent } from '../components/weapon/weapon-component.js';
import * as CONFIG from '../config.js';

export class Player extends Phaser.GameObjects.Container {
    #keyBoardInputComponent;
    #weaponComponent;
    #horizontalMovementComponent;
    #healthComponent;
    #colliderComponent;
    #shieldComponent;
    #eventBusComponent;
    #shipSprite;
    #shipEngineSprite;
    #shipEngineThrusterSprite;
    #shieldVisual;
    #doubleShotTimerEvent;
    #doubleShotTickerEvent;
    #doubleShotExpiresAt;
    #doubleShotActive;

    constructor(scene, eventBusComponent) {
        super(scene, scene.scale.width/2, scene.scale.height - 32, []);
        this.#eventBusComponent = eventBusComponent;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(24, 24);
        this.body.setOffset(-12, -12);
        this.body.setCollideWorldBounds(true);
        this.setDepth(2);

        this.#shieldVisual = scene.add.circle(0, 0, 28, 0x39d7ff, 0.2);
        this.#shieldVisual.setStrokeStyle(2, 0x8ff6ff, 0.9);
        this.#shieldVisual.setVisible(false);
        this.#shipSprite = scene.add.sprite(0, 0, 'ship');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'ship_engine');
        this.#shipEngineThrusterSprite = scene.add.sprite(0, 0, 'ship_engine_thruster');
        this.#shipEngineThrusterSprite.play('ship_engine_thruster');
        this.add([this.#shieldVisual, this.#shipEngineThrusterSprite, this.#shipEngineSprite, this.#shipSprite]);

        this.#keyBoardInputComponent = new KeyboardInputComponent(this.scene);
        this.#horizontalMovementComponent = new HorizontalMovementComponent(this, this.#keyBoardInputComponent, CONFIG.PLAYER_MOVEMENT_HORIZONTAL_VELOCITY);
        this.#weaponComponent = new WeaponComponent(this, this.#keyBoardInputComponent, {
             speed: CONFIG.PLAYER_BULLET_SPEED,
             interval: CONFIG.PLAYER_BULLET_INTERVAL,
             lifespan: CONFIG.PLAYER_BULLET_LIFESPAN,
             maxCount: CONFIG.PLAYER_BULLETS_MAX_COUNT,
            yOffset: -20,
            flipY: false, 
        }, this.#eventBusComponent);

        this.#healthComponent = new HealthComponent(CONFIG.PLAYER_HEALTH);
        this.#shieldComponent = new ShieldComponent(this.scene, this.#eventBusComponent);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, this.#shieldComponent);
        this.#doubleShotTimerEvent = undefined;
        this.#doubleShotTickerEvent = undefined;
        this.#doubleShotExpiresAt = 0;
        this.#doubleShotActive = false;

        this.#hide();
        this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_SPAWN, this.#spawn, this);
        this.#eventBusComponent.on(CUSTOM_EVENTS.POWER_UP_COLLECTED, this.#handlePowerUpCollected, this);
        this.#eventBusComponent.on(CUSTOM_EVENTS.SHIELD_CHANGED, this.#handleShieldChanged, this);
        this.#eventBusComponent.on(CUSTOM_EVENTS.SHIP_HIT, this.#flashOnHit, this);
    

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => { 
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);      
        }, this);
    }

    get weaponGameObjectGroup() {
        return this.#weaponComponent.bulletGroup;
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }

    get weaponComponent() {
        return this.#weaponComponent;
    }
    

    update(ts, dt) {
        if (!this.active){
            return;
        }

        if (this.#healthComponent.isDead) {
            this.#hide();
            this.setVisible(true);
            this.#shipSprite.play({
                key: 'explosion'
            });
            this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DESTROYED);
            return;

        }

        this.#shipSprite.setFrame((CONFIG.PLAYER_HEALTH - this.#healthComponent.life).toString(10));
        this.#keyBoardInputComponent.update();
        this.#horizontalMovementComponent.update();
        this.#weaponComponent.update(dt);

    }

    #hide() {
        this.setActive(false);
        this.setVisible(false);
        this.#shieldComponent.reset();
        this.#resetDoubleShot();
        this.#shieldVisual.setVisible(false);
        this.#shipEngineSprite.setVisible(false);
        this.#shipEngineThrusterSprite.setVisible(false);
        this.scene.tweens.killTweensOf(this.#shipSprite);
        this.#shipSprite.clearTint();
        this.#shipSprite.setAlpha(1);
        this.#keyBoardInputComponent.lockInput = true;
    }

    #spawn() {
        this.setActive(true);
        this.setVisible(true);
        this.#shipEngineSprite.setVisible(true);
        this.#shipEngineThrusterSprite.setVisible(true);
        this.#shipSprite.setTexture('ship', 0);
        this.#shipSprite.clearTint();
        this.#shipSprite.setAlpha(1);
        this.#healthComponent.reset();
        this.#shieldComponent.reset();
        this.#resetDoubleShot();
        this.setPosition(this.scene.scale.width/2, this.scene.scale.height - 32);
        this.#keyBoardInputComponent.lockInput = false;

    }

    #handlePowerUpCollected(type) {
        if (type === 'shield') {
            this.#shieldComponent.activate(CONFIG.PLAYER_POWER_UP_DURATION);
            return;
        }

        if (type === 'double_shot') {
            this.#activateDoubleShot();
        }
    }

    #handleShieldChanged(active) {
        this.#shieldVisual.setVisible(active);
    }

    #flashOnHit() {
        if (!this.active) {
            return;
        }

        this.scene.tweens.killTweensOf(this.#shipSprite);
        this.#shipSprite.setTint(0xff2f66);
        this.#shipSprite.setAlpha(0.55);

        this.scene.tweens.add({
            targets: this.#shipSprite,
            alpha: 1,
            duration: 130,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.#shipSprite.clearTint();
                this.#shipSprite.setAlpha(1);
            },
        });
    }

    #activateDoubleShot() {
        this.#clearDoubleShotTimer();
        this.#doubleShotActive = true;
        this.#doubleShotExpiresAt = this.scene.time.now + CONFIG.PLAYER_POWER_UP_DURATION;
        this.#weaponComponent.setBulletOffsets(CONFIG.PLAYER_DOUBLE_SHOT_OFFSETS);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.WEAPON_CHANGED, true);
        this.#emitDoubleShotTimer();

        this.#doubleShotTimerEvent = this.scene.time.delayedCall(CONFIG.PLAYER_POWER_UP_DURATION, () => {
            this.#resetDoubleShot();
        });

        this.#doubleShotTickerEvent = this.scene.time.addEvent({
            delay: 250,
            loop: true,
            callback: this.#emitDoubleShotTimer,
            callbackScope: this,
        });
    }

    #resetDoubleShot() {
        this.#clearDoubleShotTimer();
        this.#weaponComponent.setBulletOffsets([0]);

        if (!this.#doubleShotActive) {
            return;
        }

        this.#doubleShotActive = false;
        this.#eventBusComponent.emit(CUSTOM_EVENTS.WEAPON_CHANGED, false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.POWER_UP_TIMER_CHANGED, {
            type: 'double_shot',
            active: false,
            remainingMs: 0,
        });
    }

    #clearDoubleShotTimer() {
        if (this.#doubleShotTimerEvent) {
            this.#doubleShotTimerEvent.remove(false);
            this.#doubleShotTimerEvent = undefined;
        }

        if (this.#doubleShotTickerEvent) {
            this.#doubleShotTickerEvent.remove(false);
            this.#doubleShotTickerEvent = undefined;
        }
    }

    #emitDoubleShotTimer() {
        if (!this.#doubleShotActive) {
            return;
        }

        this.#eventBusComponent.emit(CUSTOM_EVENTS.POWER_UP_TIMER_CHANGED, {
            type: 'double_shot',
            active: true,
            remainingMs: Math.max(0, this.#doubleShotExpiresAt - this.scene.time.now),
        });
    }
}
