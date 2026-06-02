export class ColliderComponent {
    #healthComponent;

    constructor(healthComponent) {
        this.#healthComponent = healthComponent;
    }

    // 1. Quando o Jogador bate no Inimigo (Ativado no Player)
    collideWithEnemyShip() {
        if (this.#healthComponent.isDead) {
            return;
        }
        this.#healthComponent.die();
    }

    // 2. Quando o Jogador leva com um tiro do Inimigo (Ativado no Player)
    collideWithEnemyProjectile() {
        if (this.#healthComponent.isDead) {
            return;
        }
        this.#healthComponent.hit();
    }

    // 3. Quando o Inimigo bate no Jogador (Ativado no Enemy) 
    collideWithPlayerShip() {
        if (this.#healthComponent.isDead) {
            return;
        }
        this.#healthComponent.die(); // inimigo morre ao colidir
    }

    // 4. Quando o Inimigo leva com um tiro do Jogador 
    collideWithPlayerProjectile() {
        if (this.#healthComponent.isDead) {
            return;
        }
        this.#healthComponent.hit(); // O inimigo leva um tiro e perde vida
    }
}