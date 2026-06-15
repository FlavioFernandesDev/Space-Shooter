import { EventBusComponent, CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";
import * as CONFIG from '../../config.js';

const ENEMY_SCORES ={
    ScoutEnemy: CONFIG.ENEMY_SCOUT_SCORE,
    FighterEnemy: CONFIG.ENEMY_FIGHTER_SCORE,
}

export class Score extends Phaser.GameObjects.Text {
    #score;
    #eventBusComponent;
    #nextLevelMilestone; // A variável que guarda o próximo objetivo

    constructor(scene, eventBusComponent) {
        super(scene, scene.scale.width/2, 20, '0', {
            fontSize: '24px',
            color: '#ff2f66',
        });
        
        this.scene.add.existing(this);
        this.#eventBusComponent = eventBusComponent;
        this.#score = 0;
        this.#nextLevelMilestone = 1000;//1º Patamar de pontos para subir de nível
        this.setOrigin(0.5);

        this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy) => {
            this.#score += ENEMY_SCORES[enemy.constructor.name];
            this.setText(this.#score.toString(10));
    

            if (this.#score >= this.#nextLevelMilestone) {
                    // Prepara o próximo patamar (ex: de 1000 passa para 2000)
                    this.#nextLevelMilestone += 1000; 
                    // Apita para o resto do jogo acelerar
                    this.#eventBusComponent.emit(CUSTOM_EVENTS.LEVEL_UP); 
            }
        });
    }
}
