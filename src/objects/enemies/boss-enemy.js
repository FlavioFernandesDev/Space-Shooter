import { HealthComponent } from '../../components/health/health-component.js';
import { CUSTOM_EVENTS } from '../../components/events/event-bus-component.js';
import { BossRock } from './boss-rock.js';
import { getBossAttackPattern, getNextBossMoveTargetX } from '../../utils/boss-patterns.js';
import * as CONFIG from '../../config.js';

export class BossEnemy extends Phaser.GameObjects.Container {
    #healthComponent;
    #eventBusComponent;
    #shipSprite;
    #shipEngineSprite;
    #healthBarBackground;
    #healthBarFill;
    #rockGroup;
    #maxHealth;
    #bulletGroup;
    #attackTimer;
    #attackPatternIndex;
    #moveTimer;
    #moveIndex;

    constructor(scene, x, y, eventBusComponent) {
        super(scene, x, y, []);

        this.#eventBusComponent = eventBusComponent;
        this.#maxHealth = CONFIG.ENEMY_BOSS_HEALTH;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(50, 44);
        this.body.setOffset(-25, -22);
        this.body.enable = false;
        this.setDepth(2);
        this.setScale(1.45);

        this.#shipSprite = scene.make.sprite({ x: 0, y: 0, key: 'fighter', frame: 0, add: false });
        this.#shipSprite.setTint(0xffd34d);
        this.#shipEngineSprite = scene.make.sprite({ x: 0, y: 0, key: 'fighter_engine', add: false }).setFlipY(true);
        this.#shipEngineSprite.setTint(0xffa64d);
        this.#shipEngineSprite.play('fighter_engine');

        this.#healthBarBackground = scene.add.rectangle(0, -35, 70, 6, 0x2b1020, 1);
        this.#healthBarBackground.setStrokeStyle(1, 0xffffff, 0.8);
        this.#healthBarFill = scene.add.rectangle(-35, -35, 70, 4, 0xff2f66, 1);
        this.#healthBarFill.setOrigin(0, 0.5);
        this.add([this.#shipEngineSprite, this.#shipSprite, this.#healthBarBackground, this.#healthBarFill]);

        this.#rockGroup = this.scene.add.group({
            name: `${this.constructor.name}-rocks-${Phaser.Math.RND.uuid()}`,
            runChildUpdate: true,
        });

        // as rochas protegem o boss no inicio
        this.#createRocks();

        this.#bulletGroup = this.scene.physics.add.group({
            name: `${this.constructor.name}-bullets-${Phaser.Math.RND.uuid()}`,
            enable: false,
        });

        this.#bulletGroup.createMultiple({
            key: 'bullet',
            quantity: CONFIG.ENEMY_BOSS_BULLETS_MAX_COUNT,
            active: false,
            visible: false,
        });

        this.#healthComponent = new HealthComponent(this.#maxHealth);
        this.#attackTimer = CONFIG.ENEMY_BOSS_FIRST_ATTACK_DELAY;
        this.#attackPatternIndex = 0;
        this.#moveTimer = CONFIG.ENEMY_BOSS_MOVEMENT_INTERVAL;
        this.#moveIndex = 0;
        this.disable();

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            if (this.scene.physics && this.scene.physics.world) {
                this.scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);
            }
        }, this);
    }

    get healthComponent() {
        return this.#healthComponent;
    }

    get weaponGameObjectGroup() {
        return this.#bulletGroup;
    }

    get weaponComponent() {
        return this;
    }

    get rockGroup() {
        return this.#rockGroup;
    }

    get shipAssetKey() {
        return 'fighter';
    }

    get shipDestroyedAnimationKey() {
        return 'fighter_destroy';
    }

    reset(x, y) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.reset(x, y);
        this.#healthComponent.reset();
        this.#resetRocks();
        this.#updateHealthBar();
        this.#attackTimer = CONFIG.ENEMY_BOSS_FIRST_ATTACK_DELAY;
        this.#attackPatternIndex = 0;
        this.#moveTimer = CONFIG.ENEMY_BOSS_MOVEMENT_INTERVAL;
        this.#moveIndex = 0;
        this.#eventBusComponent.emit(CUSTOM_EVENTS.BOSS_HEALTH_CHANGED, {
            current: this.#healthComponent.life,
            max: this.#maxHealth,
        });
        this.#playSpawnEffect();
    }

    disable() {
        this.setActive(false);
        this.setVisible(false);

        if (this.body) {
            this.body.enable = false;
            this.body.setVelocity(0, 0);
        }

        this.scene.tweens.killTweensOf(this);
        this.#rockGroup.getChildren().forEach((rock) => rock.disable());
        this.#bulletGroup.getChildren().forEach((bullet) => {
            if (bullet.active) {
                bullet.disableBody(true, true);
            }
        });
    }

    destroyBullet(bullet) {
        if (!bullet || !bullet.active) {
            return;
        }

        bullet.setState(0);
        bullet.disableBody(true, true);
    }

    hitByPlayerProjectile() {
        // enquanto houver rochas, o boss nao perde vida
        if (!this.active || this.#hasActiveRocks()) {
            return;
        }

        this.#healthComponent.hit();
        this.#updateHealthBar();
        this.#eventBusComponent.emit(CUSTOM_EVENTS.BOSS_HEALTH_CHANGED, {
            current: this.#healthComponent.life,
            max: this.#maxHealth,
        });

        if (!this.#healthComponent.isDead) {
            return;
        }

        this.#playDestroyedEffect();
        this.disable();
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.BOSS_PHASE_ENDED);
    }

    update(ts, dt) {
        if (!this.active) {
            return;
        }

        this.#updateAttack(dt);
        this.#updateMovement(dt);
        this.#syncActiveRocksToBoss();
    }

    worldstep(delta) {
        this.#bulletGroup.getChildren().forEach((bullet) => {
            if (!bullet.active) {
                return;
            }

            bullet.state -= delta;
            if (bullet.state <= 0) {
                bullet.disableBody(true, true);
            }
        });
    }

    #createRocks() {
        // cria as rochas uma vez e depois so as repoe
        for (let i = 0; i < 4; i++) {
            const rock = new BossRock(this.scene, 0, 0);
            this.#rockGroup.add(rock);
        }
    }

    #resetRocks() {
        const rockOffsets = this.#getRockOffsets();

        this.#rockGroup.getChildren().forEach((rock, index) => {
            const offset = rockOffsets[index];
            rock.reset(this.x + offset.x, this.y + offset.y);
        });
    }

    #hasActiveRocks() {
        return this.#rockGroup.getChildren().some((rock) => rock.active);
    }

    #updateAttack(dt) {
        // troca o padrao de ataque a cada cooldown
        this.#attackTimer -= dt;

        if (this.#attackTimer > 0) {
            return;
        }

        const pattern = getBossAttackPattern(this.#attackPatternIndex);
        const bulletsFired = this.#firePattern(pattern);
        this.#attackPatternIndex += 1;
        this.#attackTimer = pattern.cooldownMs;

        if (bulletsFired > 0) {
            this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_SHOOT);
        }
    }

    #firePattern(pattern) {
        let bulletsFired = 0;

        pattern.bullets.forEach((bulletConfig) => {
            // reutiliza uma bala livre do boss
            const bullet = this.#bulletGroup.getFirstDead();
            if (!bullet) {
                return;
            }

            const x = this.x + bulletConfig.offsetX;
            const y = this.y + 24;
            bullet.enableBody(true, x, y, true, true);
            bullet.body.setVelocity(bulletConfig.velocityX, CONFIG.ENEMY_BOSS_BULLET_VERTICAL_SPEED);
            bullet.setState(CONFIG.ENEMY_BOSS_BULLET_LIFESPAN);
            bullet.play('bullet');
            bullet.setScale(0.8);
            bullet.setTint(pattern.tint);
            bullet.body.setSize(14, 18);
            bullet.setFlipY(true);
            bulletsFired += 1;
        });

        return bulletsFired;
    }

    #updateMovement(dt) {
        // se ja estiver a mover, espera o tween acabar
        if (this.scene.tweens.isTweening(this)) {
            return;
        }

        this.#moveTimer -= dt;

        if (this.#moveTimer > 0) {
            return;
        }

        const targetX = getNextBossMoveTargetX(
            this.x,
            this.scene.scale.width,
            this.#moveIndex,
            CONFIG.ENEMY_BOSS_MOVEMENT_MARGIN
        );

        this.#moveIndex += 1;
        this.#moveTimer = CONFIG.ENEMY_BOSS_MOVEMENT_INTERVAL;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            duration: CONFIG.ENEMY_BOSS_MOVEMENT_DURATION,
            ease: 'Sine.easeInOut',
            onUpdate: () => this.#syncActiveRocksToBoss(),
        });
    }

    #syncActiveRocksToBoss() {
        // as rochas acompanham a posicao do boss
        const rockOffsets = this.#getRockOffsets();

        this.#rockGroup.getChildren().forEach((rock, index) => {
            if (!rock.active) {
                return;
            }

            const offset = rockOffsets[index];
            const x = this.x + offset.x;
            const y = this.y + offset.y;
            rock.setPosition(x, y);

            if (rock.body) {
                rock.body.reset(x, y);
            }
        });
    }

    #getRockOffsets() {
        return [
            { x: -66, y: 34 },
            { x: -24, y: 56 },
            { x: 24, y: 56 },
            { x: 66, y: 34 },
        ];
    }

    #updateHealthBar() {
        const healthPercent = Phaser.Math.Clamp(this.#healthComponent.life / this.#maxHealth, 0, 1);
        this.#healthBarFill.setScale(healthPercent, 1);
    }

    #playSpawnEffect() {
        this.scene.tweens.killTweensOf(this);
        this.setAlpha(0.25);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 350,
            ease: 'Sine.easeOut',
        });

        const ring = this.scene.add.circle(this.x, this.y, 34, 0xffd34d, 0);
        ring.setStrokeStyle(2, 0xffd34d, 0.9);
        ring.setDepth(1);

        this.scene.tweens.add({
            targets: ring,
            alpha: 0,
            scale: 2,
            duration: 480,
            ease: 'Sine.easeOut',
            onComplete: () => ring.destroy(),
        });
    }

    #playDestroyedEffect() {
        this.scene.cameras.main.shake(180, 0.01);

        const burst = this.scene.add.circle(this.x, this.y, 20, 0xffd34d, 0.25);
        burst.setStrokeStyle(3, 0xffffff, 0.9);
        burst.setDepth(5);

        this.scene.tweens.add({
            targets: burst,
            alpha: 0,
            scale: 3,
            duration: 520,
            ease: 'Sine.easeOut',
            onComplete: () => burst.destroy(),
        });
    }
}
