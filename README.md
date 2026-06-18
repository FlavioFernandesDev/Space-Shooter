# Space Defender

Space Defender é um jogo 2D em Phaser onde o jogador controla uma nave, desvia-se de inimigos e projéteis, recolhe power-ups e tenta alcançar a melhor pontuação possível.

## Mecânicas principais

- Movimento horizontal com as setas e disparo com `SPACE`.
- Inimigos Scout e Fighter com padrões de movimento diferentes.
- Dificuldade progressiva: a cada patamar de pontuação, os inimigos aparecem e movem-se mais depressa.
- Boss por pontuação, com barra de vida, alerta visual, rochas defensivas e disparo triplo.
- Power-ups temporários: escudo e tiro duplo, com estado visível no HUD.
- Sistema de vidas, pausa, game over, reinício e regresso ao menu.
- High score guardado localmente no browser com `localStorage`.
- Feedback visual com explosões, popup de pontuação, flash ao sofrer dano e camera shake.

## Tecnologias

- Phaser 3 com Arcade Physics.
- JavaScript modular com ES Modules.
- HTML/CSS simples, sem build step.
- Assets carregados através de manifestos JSON.
- Áudio em MP3 para música, disparos, impactos e explosões.

## Organização do código

- `src/scenes`: fluxo principal do jogo, preload, menu, pausa, game over e gameplay.
- `src/objects`: jogador, inimigos, power-ups, áudio e elementos de HUD.
- `src/components`: input, movimento, armas, colisões, vida, spawners e eventos.
- `assets/data`: manifestos de assets, animações e traduções PT/EN.

## Padrões usados

- Componentes para separar input, movimento, armas, colisões e vida.
- Event Bus para comunicar score, vidas, boss, power-ups, áudio e feedback visual.
- Object pooling nos projéteis e nos inimigos criados pelos spawners.
- Configuração centralizada em `src/config.js`.
- Internacionalização simples com `assets/data/translations.json`.

## Créditos de assets

Os sprites e sons usados estão em `assets/images` e `assets/audio`. Os ficheiros de licença incluídos nas pastas de assets devem ser mantidos na entrega.
