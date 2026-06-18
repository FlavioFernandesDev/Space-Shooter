import assert from 'node:assert/strict';
import {
    getStoredBestScore,
    saveBestScoreIfHigher,
} from '../src/utils/score-storage.js';

function createMemoryStorage(initialValues = {}) {
    const values = new Map(Object.entries(initialValues));

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
    };
}

const key = 'space-defender-best-score-test';

assert.equal(getStoredBestScore(createMemoryStorage(), key), 0);
assert.equal(getStoredBestScore(createMemoryStorage({ [key]: 'invalid' }), key), 0);
assert.equal(getStoredBestScore(createMemoryStorage({ [key]: '-50' }), key), 0);
assert.equal(getStoredBestScore(createMemoryStorage({ [key]: '1200' }), key), 1200);

const storage = createMemoryStorage({ [key]: '500' });
assert.equal(saveBestScoreIfHigher(storage, key, 300), 500);
assert.equal(storage.getItem(key), '500');
assert.equal(saveBestScoreIfHigher(storage, key, 900), 900);
assert.equal(storage.getItem(key), '900');

console.log('score-storage tests passed');
