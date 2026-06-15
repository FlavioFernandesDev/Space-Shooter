export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        // Fundo um pouco mais escuro
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.text(centerX, centerY - 40, 'GAME OVER', {
            fontSize: '48px', fill: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 30, 'Prime [R] para Reiniciar', {
            fontSize: '20px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 70, 'Prime [M] para o Menu', {
            fontSize: '20px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-R', () => {
            this.sound.stopAll();
            this.scene.stop('GameScene'); // Limpa a cena velha
            this.scene.start('GameScene'); // Arranca uma nova
        });

        this.input.keyboard.on('keydown-M', () => {
            this.sound.stopAll();
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });
    }
}