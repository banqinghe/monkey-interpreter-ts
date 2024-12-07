import assert from 'node:assert';
import { test, describe } from 'node:test';
import { MonkeyString } from '../src/object';

describe('object', () => {
    test('hash key', () => {
        const hello1 = new MonkeyString('Hello World');
        const hello2 = new MonkeyString('Hello World');

        const diff1 = new MonkeyString('My name is johnny');
        const diff2 = new MonkeyString('My name is johnny');

        assert.strictEqual(hello1.hashKey(), hello2.hashKey());
        assert.strictEqual(diff1.hashKey(), diff2.hashKey());
        assert.notStrictEqual(hello1.hashKey(), diff1.hashKey());
    });
});
