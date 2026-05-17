import { Player } from '../objects/player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.pack('assets_pack', 'assets/data/assets.json');
    }

    create() {
        const player = new Player(this);
        this.add.sprite(100, 100, 'ship');
      
    }
}