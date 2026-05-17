//importar cenas
import { BootScene } from './scenes/boot-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { GameScene } from './scenes/game-scene.js';

const config = {
    type: Phaser.CANVAS,
    roundPixels: true,
    pixelArt: true,
    scale: {
        parent: 'game-container', 
        width: 450,
        height: 640,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade', // Usar o sistema de física Arcade
        arcade: {
            gravity: { y: 0, x: 0 }, 
            debug: true, // Mostra as caixas de colisão. Lembra-te de meter 'false' na entrega final!
        }
    }
};

const game = new Phaser.Game(config);

game.scene.add('BootScene', BootScene);
game.scene.add('PreloadScene', PreloadScene);
game.scene.add('GameScene', GameScene);
game.scene.start('BootScene');

