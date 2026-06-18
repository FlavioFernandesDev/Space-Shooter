import { CUSTOM_EVENTS } from '../events/event-bus-component.js';

export class ShieldComponent {
    #scene;
    #eventBusComponent;
    #active;
    #timerEvent;
    #tickerEvent;
    #expiresAt;

    constructor(scene, eventBusComponent) {
        this.#scene = scene;
        this.#eventBusComponent = eventBusComponent;
        this.#active = false;
        this.#timerEvent = undefined;
        this.#tickerEvent = undefined;
        this.#expiresAt = 0;
    }

    get isActive() {
        return this.#active;
    }

    activate(duration) {
        this.#clearTimer();
        this.#active = true;
        this.#expiresAt = this.#scene.time.now + duration;
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIELD_CHANGED, true);
        this.#emitTimer();

        this.#timerEvent = this.#scene.time.delayedCall(duration, () => {
            this.deactivate();
        });

        this.#tickerEvent = this.#scene.time.addEvent({
            delay: 250,
            loop: true,
            callback: this.#emitTimer,
            callbackScope: this,
        });
    }

    absorbHit() {
        if (!this.#active) {
            return false;
        }

        this.deactivate();
        return true;
    }

    deactivate() {
        if (!this.#active) {
            return;
        }

        this.#clearTimer();
        this.#active = false;
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIELD_CHANGED, false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.POWER_UP_TIMER_CHANGED, {
            type: 'shield',
            active: false,
            remainingMs: 0,
        });
    }

    reset() {
        this.deactivate();
    }

    #clearTimer() {
        if (this.#timerEvent) {
            this.#timerEvent.remove(false);
            this.#timerEvent = undefined;
        }

        if (this.#tickerEvent) {
            this.#tickerEvent.remove(false);
            this.#tickerEvent = undefined;
        }
    }

    #emitTimer() {
        if (!this.#active) {
            return;
        }

        this.#eventBusComponent.emit(CUSTOM_EVENTS.POWER_UP_TIMER_CHANGED, {
            type: 'shield',
            active: true,
            remainingMs: Math.max(0, this.#expiresAt - this.#scene.time.now),
        });
    }
}
