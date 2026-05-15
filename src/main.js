// Configuração base do teu jogo
const config = {
    type: Phaser.AUTO, // O Phaser escolhe renderizar em WebGL ou Canvas
    width: 800,        // Largura do ecrã do jogo
    height: 600,       // Altura do ecrã do jogo
    physics: {
        default: 'arcade', // Física obrigatória para as colisões do teu shooter [cite: 11, 41]
        arcade: {
            gravity: { y: 0 }, // Num space shooter top-down não há gravidade a puxar para baixo!
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Arranca o motor do jogo com as configurações acima
const game = new Phaser.Game(config);

// 1. PRELOAD: Carregar imagens e sons antes do jogo começar 
function preload() {
    // É aqui que vais colocar: this.load.image('nave', 'assets/nave.png');
}

// 2. CREATE: Colocar as coisas no ecrã quando o jogo arranca 
function create() {
    // Pinta o fundo de azul escuro para simular o espaço
    this.cameras.main.setBackgroundColor('#0a0a2a');
    
    // É aqui que vais colocar: const minhaNave = this.physics.add.sprite(400, 500, 'nave');
}

// 3. UPDATE: Corre em loop contínuo (movimento, tiros, colisões) 
function update() {
    // É aqui que vais verificar as teclas: se a seta esquerda estiver premida, move a nave.
}