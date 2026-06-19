# Space Defender

## Identificação

- Flávio Fernandes - Nº33215
- Micael Martins - Nº34613

## Link do jogo

O jogo está publicado no GitHub Pages:

[https://flaviofernandesdev.github.io/Space-Shooter/](https://flaviofernandesdev.github.io/Space-Shooter/)

O GitHub Pages está configurado para usar a branch `main`, na pasta raiz `/` do projeto.

## Descrição do jogo

O **Space Defender** é um jogo 2D feito em Phaser. O jogador controla uma nave no espaço, dispara contra inimigos, evita tiros e tenta sobreviver o máximo de tempo possível.

Durante o jogo aparecem vários inimigos, power-ups e bosses. A pontuação aumenta quando destruímos inimigos. O objetivo principal é fazer a melhor pontuação possível e bater o recorde guardado no browser.

## Tipo e género

- **Tipo:** jogo web 2D
- **Género:** arcade, space shooter / shoot 'em up
- **Modo de jogo:** single-player
- **Câmara:** vista lateral/top-down simples, com movimento horizontal da nave

## Tecnologias usadas

- Phaser `3.80.1`
- JavaScript com ES Modules
- HTML e CSS simples
- Phaser Arcade Physics
- Assets carregados através de ficheiros JSON
- `localStorage` para guardar a melhor pontuação

O projeto não precisa de instalação de dependências nem de build step. Basta correr num servidor local ou abrir pelo GitHub Pages.

## Objetivo

O objetivo do jogo é:

- controlar a nave do jogador;
- destruir o maior número possível de inimigos;
- evitar tiros, bosses e colisões;
- apanhar power-ups para sobreviver mais tempo;
- derrotar bosses;
- conseguir a maior pontuação possível.

## Regras do jogo

- O jogador começa com 3 naves.
- A nave pode mover-se para a esquerda e para a direita.
- O jogador dispara para destruir inimigos.
- Se a nave for atingida por tiros inimigos, perde vida.
- Se a nave colidir com um inimigo, perde essa nave.
- Quando uma nave é destruída, o jogador volta a aparecer se ainda tiver vidas disponíveis.
- O jogo acaba quando o jogador perde as 3 naves.
- A dificuldade aumenta ao longo da pontuação.
- O boss aparece por pontuação e é mais difícil de derrotar.
- A melhor pontuação fica guardada no browser.

## Controlos

| Tecla | Ação |
| --- | --- |
| `Seta Esquerda` | Mover a nave para a esquerda |
| `Seta Direita` | Mover a nave para a direita |
| `Espaço` | Disparar / começar o jogo |
| `P` | Pausar ou continuar |
| `M` | Voltar ao menu |
| `R` | Reiniciar depois do game over |
| `L` | Trocar idioma entre PT e EN no menu |

## Pontuação

- Scout: 100 pontos
- Fighter: 200 pontos
- Boss: 800 pontos

A dificuldade aumenta a cada 1000 pontos. Com o aumento da dificuldade, os inimigos aparecem mais depressa, movem-se mais rápido e os Fighters disparam com menos intervalo.

## Funcionalidades implementadas

- Menu inicial com melhor pontuação.
- Idioma em português e inglês.
- Jogador com nave animada.
- Movimento horizontal da nave.
- Sistema de disparo com limite de projéteis.
- Inimigos Scout e Fighter.
- Boss com barra de vida.
- Boss com rochas defensivas e disparo triplo.
- Sistema de vidas do jogador.
- Sistema de vida da nave.
- Ecrã de pausa.
- Ecrã de game over.
- Reinício do jogo.
- Regresso ao menu.
- Pontuação atual no HUD.
- Melhor pontuação guardada com `localStorage`.
- Aumento progressivo da dificuldade.
- Power-up de escudo.
- Power-up de tiro duplo.
- Estado dos power-ups visível no HUD.
- Efeitos visuais de explosão.
- Feedback visual quando o jogador sofre dano.
- Camera shake em impactos importantes.
- Música de fundo e efeitos sonoros.

## Como executar o projeto

### Opção 1: GitHub Pages

A forma mais simples é abrir o jogo diretamente no link:

[https://flaviofernandesdev.github.io/Space-Shooter/](https://flaviofernandesdev.github.io/Space-Shooter/)

### Opção 2: servidor local

Também é possível correr o jogo localmente.

1. Clonar o repositório:

```bash
git clone https://github.com/FlavioFernandesDev/Space-Shooter.git
```

2. Entrar na pasta do projeto:

```bash
cd Space-Shooter
```

3. Iniciar um servidor local:

```bash
python3 -m http.server 8000
```

4. Abrir no browser:

```text
http://localhost:8000
```

É recomendado usar um servidor local em vez de abrir o `index.html` diretamente, porque o jogo usa módulos JavaScript e carregamento de assets.

## Aspetos multimédia

O jogo usa vários elementos multimédia para ficar mais completo:

- sprites pixel art para a nave do jogador;
- sprites para inimigos Scout e Fighter;
- animações da nave e dos motores;
- animações de explosão;
- fundos animados para criar ambiente de espaço;
- música de fundo;
- som de disparo;
- som de impacto;
- som de explosão;
- efeitos visuais no HUD.

## Organização do código

- `index.html`: página principal que carrega o Phaser e o jogo.
- `src/main.js`: configuração do Phaser e arranque das cenas.
- `src/scenes`: cenas do jogo, como boot, preload, menu, jogo, pausa e game over.
- `src/objects`: jogador, inimigos, boss, power-ups, áudio e HUD.
- `src/components`: componentes de input, movimento, colisões, vida, armas, eventos e spawners.
- `src/utils`: funções auxiliares para dificuldade e pontuação.
- `assets/data`: ficheiros JSON com assets, animações e traduções.
- `assets/images`: imagens e sprites usados no jogo.
- `assets/audio`: músicas e efeitos sonoros.

## Padrões e ideias usadas

Para o código ficar mais organizado, foram usadas algumas ideias:

- Separação por cenas do Phaser.
- Componentes para dividir responsabilidades como movimento, vida, colisões e armas.
- Event Bus para comunicar acontecimentos do jogo.
- Object pooling para reutilizar inimigos e projéteis.
- Configuração centralizada no ficheiro `src/config.js`.
- Traduções simples em JSON para PT e EN.

## Créditos dos assets

Os assets visuais da nave e sprites vêm de Foozle/Baldur e têm licença Creative Commons Zero (CC0).

Os assets de áudio foram criados por Luis Zuno (@ansimuz). A licença permite usar e modificar os ficheiros em projetos pessoais ou comerciais.

Os ficheiros de licença foram mantidos nas pastas:

- `assets/images/foozle/Readme.txt`
- `assets/audio/ansimuz/public-license.txt`

## Conclusão

Este projeto mostra um jogo arcade completo feito em Phaser, com inimigos, boss, power-ups, pontuação, dificuldade progressiva, som, animações e publicação no GitHub Pages.
