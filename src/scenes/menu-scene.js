export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        //Vai buscar a língua e o dicionário
        const lang = this.registry.get('lang');
        const t = this.cache.json.get('translations')[lang];

        this.add.sprite(0, 0, 'bg1', 0).setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25).play('bg1');
        
        const centerX = Math.floor(this.scale.width / 2);
        const centerY = Math.floor(this.scale.height / 2);

        
        this.add.text(centerX, centerY - 50, t.MENU_TITLE, {
            fontSize: '48px', fill: '#ffffff', fontStyle: 'bold', resolution: 2
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 50, t.MENU_START, {
            fontSize: '24px', fill: '#ffff00', resolution: 2
        }).setOrigin(0.5);

        const bestScore = this.registry.get('bestScore') || 0;
        this.add.text(centerX, centerY + 88, t.MENU_BEST.replace('{score}', bestScore), {
            fontSize: '18px', fill: '#39d7ff', resolution: 2
        }).setOrigin(0.5);

        // 1. Forçamos o arredondamento para o píxel inteiro mais próximo
        const langTextX = Math.floor(centerX);
        const langTextY = Math.floor(centerY + 122);

        const langText = this.add.text(langTextX, langTextY, t.MENU_LANG, {
        fontSize: '20px', 
        fill: '#aaaaaa', 
        resolution: 4 
        }).setOrigin(0.5);


        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });

        // 3Botão para trocar de língua
        this.input.keyboard.on('keydown-L', () => {
            // Se for 'pt' passa a 'en', se for 'en' passa a 'pt'
            const newLang = lang === 'pt' ? 'en' : 'pt'; 
            this.registry.set('lang', newLang); // Grava a nova língua
            this.scene.restart(); // Reinicia o ecrã para desenhar as letras novas
        });
    }
}
