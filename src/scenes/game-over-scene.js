export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const lang = this.registry.get('lang');
        const t = this.cache.json.get('translations')[lang];

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);

        const centerX = Math.floor(this.scale.width / 2);
        const centerY = Math.floor(this.scale.height / 2);
        const lastScore = this.registry.get('lastScore') || 0;
        const bestScore = this.registry.get('bestScore') || 0;

        this.add.text(centerX, centerY - 86, t.GAME_OVER_TITLE, {
            fontSize: '48px', fill: '#ff0000', fontStyle: 'bold', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 26, t.GAME_OVER_SCORE.replace('{score}', lastScore), {
            fontSize: '22px', fill: '#ffffff', fontStyle: 'bold', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 4, t.GAME_OVER_BEST.replace('{score}', bestScore), {
            fontSize: '20px', fill: '#39d7ff', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 56, t.GAME_OVER_RESTART, {
            fontSize: '20px', fill: '#ffffff', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 94, t.GAME_OVER_MENU, {
            fontSize: '20px', fill: '#ffffff', resolution: 2
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-R', () => {
            this.sound.stopAll();
            this.scene.stop('GameScene');
            this.scene.start('GameScene');
        });

        this.input.keyboard.on('keydown-M', () => {
            this.sound.stopAll();
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });
    }
}
