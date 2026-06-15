export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        const lang = this.registry.get('lang');
        const t = this.cache.json.get('translations')[lang];

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0);

        const centerX = Math.floor(this.scale.width / 2);
        const centerY = Math.floor(this.scale.height / 2);

        this.add.text(centerX, centerY - 30, t.PAUSE_TITLE, {
            fontSize: '40px', fill: '#ffffff', fontStyle: 'bold', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 30, t.PAUSE_RESUME, {
            fontSize: '20px', fill: '#aaaaaa', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 70, t.PAUSE_MENU, {
            fontSize: '20px', fill: '#aaaaaa', resolution: 2
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-P', () => {
            this.scene.resume('GameScene');
            this.scene.stop();
        });

        this.input.keyboard.on('keydown-M', () => {
            this.sound.stopAll();
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });
    }
}