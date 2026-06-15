export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        // Fundo escuro semitransparente para dar o efeito de pausa
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.text(centerX, centerY - 30, 'PAUSA', {
            fontSize: '40px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 30, 'Prime [P] para continuar', {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 70, 'Prime [M] para o Menu', {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Se carregar P, o jogo retoma
        this.input.keyboard.on('keydown-P', () => {
            this.scene.resume('GameScene');
            this.scene.stop(); // Fecha o ecrã de pausa
        });

        // Se carregar M, volta ao Menu Principal
        this.input.keyboard.on('keydown-M', () => {
            this.sound.stopAll();
            this.scene.stop('GameScene'); // Mata o jogo que estava a correr por trás
            this.scene.start('MenuScene'); // Vai para o menu
        });
    }
}