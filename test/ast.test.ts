import assert from 'node:assert';
import { test, describe } from 'node:test';
import Token from '../src/token';
import { Identifier, LetStatement, Program } from '../src/ast';

describe('ast', () => {
    test('let statement', () => {
        const program = new Program([
            new LetStatement({
                name: new Identifier({
                    token: new Token(Token.IDENT, 'var'),
                    value: 'var',
                }),
                value: new Identifier({
                    token: new Token(Token.IDENT, 'anotherVar'),
                    value: 'anotherVar',
                }),
            }),
        ]);

        // console.log(JSON.stringify(program, null, 4));

        assert.strictEqual(program.toString(), 'let var = anotherVar');
    });
});
