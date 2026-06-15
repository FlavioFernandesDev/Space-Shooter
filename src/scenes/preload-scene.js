export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }
    
    preload() {
        this.load.pack('assets_pack', 'assets/data/assets.json');
        this.load.json('translations', 'assets/data/translations.json');
    }

    create() {
        this.#createAnimations();
        this.registry.set('lang', 'pt');
        this.scene.start('MenuScene');
    }

    #createAnimations() {
        const data = this.cache.json.get('animations_json');
        data.forEach((animation)=> {
            const frames = animation.frames ? this.anims.generateFrameNumbers(animation.assetKey, {frames: animation.frames}) :
            this.anims.generateFrameNumbers(animation.assetKey);
            this.anims.create({
                key: animation.key,
                frames: frames,
                frameRate: animation.frameRate,
                repeat: animation.repeat,
            });
        });
}
}
