import { EventBusComponent, CUSTOM_EVENTS } from "../../components/events/event-bus-component.js";
import { getStoredBestScore, saveBestScoreIfHigher } from '../../utils/score-storage.js';
import * as CONFIG from '../../config.js';

const ENEMY_SCORES ={
    ScoutEnemy: CONFIG.ENEMY_SCOUT_SCORE,
    FighterEnemy: CONFIG.ENEMY_FIGHTER_SCORE,
    BossEnemy: CONFIG.ENEMY_BOSS_SCORE,
}

export class Score extends Phaser.GameObjects.Text {
    #score;
    #eventBusComponent;
    #nextLevelMilestone; // A variável que guarda o próximo objetivo
    #level;
    #bestScore;

    constructor(scene, eventBusComponent) {
        super(scene, scene.scale.width/2, 20, '0', {
            fontSize: '24px',
            color: '#ff2f66',
            fontStyle: 'bold',
            resolution: 2,
        });
        
        this.scene.add.existing(this);
        this.#eventBusComponent = eventBusComponent;
        this.#score = 0;
        this.#level = 1;
        this.#bestScore = getStoredBestScore(this.#getStorage(), CONFIG.BEST_SCORE_STORAGE_KEY);
        this.#nextLevelMilestone = CONFIG.DIFFICULTY_LEVEL_SCORE_STEP;//1º Patamar de pontos para subir de nível
        this.setOrigin(0.5);
        this.setDepth(4);
        this.scene.registry.set('lastScore', this.#score);
        this.scene.registry.set('bestScore', this.#bestScore);

        this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy) => {
            const scoreGained = ENEMY_SCORES[enemy.constructor.name] || 0;
            if (scoreGained <= 0) {
                return;
            }

            this.#score += scoreGained;
            this.#bestScore = saveBestScoreIfHigher(this.#getStorage(), CONFIG.BEST_SCORE_STORAGE_KEY, this.#score);
            this.scene.registry.set('lastScore', this.#score);
            this.scene.registry.set('bestScore', this.#bestScore);
            this.setText(this.#score.toString(10));
            this.#showScoreGained(enemy, scoreGained);
            this.#pulseScore();
            this.#eventBusComponent.emit(CUSTOM_EVENTS.SCORE_GAINED, {
                score: this.#score,
                bestScore: this.#bestScore,
                gained: scoreGained,
                x: enemy.x,
                y: enemy.y,
            });
            this.#eventBusComponent.emit(CUSTOM_EVENTS.SCORE_CHANGED, {
                score: this.#score,
                bestScore: this.#bestScore,
            });
    

            while (this.#score >= this.#nextLevelMilestone) {
                this.#nextLevelMilestone += CONFIG.DIFFICULTY_LEVEL_SCORE_STEP; 
                this.#level += 1;
                this.#eventBusComponent.emit(CUSTOM_EVENTS.LEVEL_UP, {
                    level: this.#level,
                    score: this.#score,
                }); 
            }
        });
    }

    #getStorage() {
        if (typeof localStorage === 'undefined') {
            return undefined;
        }

        return localStorage;
    }

    #showScoreGained(enemy, scoreGained) {
        if (!enemy) {
            return;
        }

        const popup = this.scene.add.text(enemy.x, enemy.y, `+${scoreGained}`, {
            fontSize: '16px',
            color: '#ffd34d',
            fontStyle: 'bold',
            stroke: '#250b18',
            strokeThickness: 3,
            resolution: 2,
        });

        popup.setOrigin(0.5);
        popup.setDepth(7);

        this.scene.tweens.add({
            targets: popup,
            y: popup.y - 26,
            alpha: 0,
            scale: 1.15,
            duration: 650,
            ease: 'Sine.easeOut',
            onComplete: () => popup.destroy(),
        });
    }

    #pulseScore() {
        this.scene.tweens.killTweensOf(this);
        this.setScale(1.16);

        this.scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 160,
            ease: 'Sine.easeOut',
        });
    }
}
