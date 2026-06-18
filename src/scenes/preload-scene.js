import { getStoredBestScore } from '../utils/score-storage.js';
import * as CONFIG from '../config.js';

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
        this.registry.set('lastScore', 0);
        this.registry.set('bestScore', getStoredBestScore(this.#getStorage(), CONFIG.BEST_SCORE_STORAGE_KEY));
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

    #getStorage() {
        if (typeof localStorage === 'undefined') {
            return undefined;
        }

        return localStorage;
    }
}
