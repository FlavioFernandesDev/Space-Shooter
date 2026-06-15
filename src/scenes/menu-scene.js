export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Colocamos o fundo animado para dar vida ao menu
        this.add.sprite(0, 0, 'bg1', 0).setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25).play('bg1');
        
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // O Título do jogo
        this.add.text(centerX, centerY - 50, 'SPACE DEFENDER', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // A instrução a piscar e com cor diferente
        this.add.text(centerX, centerY + 50, 'Prime [ESPAÇO] para Começar', {
            fontSize: '24px',
            fill: '#ffff00'
        }).setOrigin(0.5);

        // Fica à espera da tecla Espaço para arrancar o jogo
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}