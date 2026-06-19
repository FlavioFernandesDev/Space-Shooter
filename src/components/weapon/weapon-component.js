import { EventBusComponent, CUSTOM_EVENTS, } from "../events/event-bus-component.js";

export class WeaponComponent {
    #gameObject;
    #inputComponent;
    #bulletgroup;
    #fireBulletInterval;
    #bulletConfig;
    #eventBusComponent;
    #bulletOffsetsX;

    constructor(gameObject, inputComponent, bulletConfig, eventBusComponent) {
        this.#gameObject = gameObject;
        this.#inputComponent = inputComponent;
        this.#bulletConfig = bulletConfig;
        this.#eventBusComponent = eventBusComponent;
        this.#fireBulletInterval = 0; 
        this.#bulletOffsetsX = this.#bulletConfig.bulletOffsetsX || [0];

        this.#bulletgroup = this.#gameObject.scene.physics.add.group({
            name: `bullets-${Phaser.Math.RND.uuid()}`,
            enable: false,
        });

        this.#bulletgroup.createMultiple({
            key: 'bullet',
            quantity: this.#bulletConfig.maxCount,
            active: false,
            visible: false,
        });

        this.#gameObject.scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);
        this.#gameObject.once(Phaser.GameObjects.Events.DESTROY, () => { 
            this.#gameObject.scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);      
        }, this);
    }

    get bulletGroup() {
        
        return this.#bulletgroup;
    }

    setBulletOffsets(offsets) {
        this.#bulletOffsetsX = offsets;
    }

    setFireInterval(interval) {
        if (!Number.isFinite(interval) || interval <= 0) {
            return;
        }

        this.#bulletConfig.interval = interval;
        this.#fireBulletInterval = Math.min(this.#fireBulletInterval, interval);
    }

    update(dt) {
        this.#fireBulletInterval -= dt;

        if (this.#fireBulletInterval > 0) {
            return;
        }

        if (this.#inputComponent.shootIsDown) {
            let bulletsFired = 0;

            this.#bulletOffsetsX.forEach((offsetX) => {
                const bullet = this.#bulletgroup.getFirstDead();
                if (bullet == undefined || bullet == null) {
                    return;
                }

                const x = this.#gameObject.x + offsetX;
                const y = this.#gameObject.y + this.#bulletConfig.yOffset;
                bullet.enableBody(true, x, y, true, true);
                bullet.body.velocity.y -= this.#bulletConfig.speed;
                bullet.setState(this.#bulletConfig.lifespan);
                bullet.play('bullet');
                
                if (typeof bullet.setScale === 'function') {
                    bullet.setScale(0.8);
                }
                
                bullet.body.setSize(14, 18);
                bullet.setFlipY(this.#bulletConfig.flipY);
                bulletsFired += 1;
            });

            if (bulletsFired === 0) {
                return;
            }

            this.#fireBulletInterval = this.#bulletConfig.interval;
            this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_SHOOT);
        }
    }

    worldstep(delta) {
        this.#bulletgroup.getChildren().forEach(bullet => {
            if (!bullet.active) {
                return;
            }

            bullet.state -= delta;
            if (bullet.state <= 0) {
                bullet.disableBody(true, true);
            }
        }); 
    }
        destroyBullet(bullet){
            if (!bullet || !bullet.active) {
                return;
            }

            bullet.setState(0);
            bullet.disableBody(true, true);
        }

}
