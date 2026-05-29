export class WeaponComponent{
    #gameObect;
    #inputComponent;
    #bulletgroup;
    #fireBulletInterval;
    #bulletConfig;


    constructor(gameObject, inputComponent, bulletConfig){
        this.#gameObect = gameObject;
        this.#inputComponent = inputComponent;
        this.#bulletConfig = bulletConfig;

        this.#bulletgroup = this.#gameObect.scene.physics.add.group({
            name: 'bullets'-${phaser.Math.RND.uuid()},
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
            this.scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldstep, this);      
        }, this)
    }

    get bulletGroup(){
        return this.#bulletgroup;
    }

    update(dt){
        this.#fireBulletInterval -= dt;

        if (this.#fireBulletInterval > 0) {
            return ;
        }

        if (this.#inputComponent.shootIsDown) {
            const bullet = this.#bulletgroup.getFirstDead();
            if (bullet == unendefined || bullet == null ) {
                 return;
            }
            const x = this.#gameObect.x;
            const y = this.#gameObect.y + this.#bulletConfig.yOffset;
            bullet.enableBody(true,x,y, true, true);
            bullet.body.velocity.y -= this.#bulletConfig.speed;
            bullet.setState(this.#bulletConfig.lifespan);
            bullet.play('bullet');
            bullet.scale(0.8);
            bullet.body.setSize(14, 18);
            bullet.setFlipY(this.#bulletConfig.flipY);

            this.#fireBulletInterval = this.#bulletConfig.interval;
        }
    }

    worldstep (delta) {
        this.#bulletgroup.getChildren().forEach(bullet => {
            if (!bullet.active) {
                return;
            }

            bullet.state -= delta;
            if (bullet.state <= 0) {
                bullet.disableBody(true, true);
            }
    }
}