import assert from 'node:assert';
import { test, describe } from 'node:test';
import Token from '../src/token';
import { ExpressionStatement, HashLiteral, Identifier, LetStatement, Program } from '../src/ast';

describe('ast', () => {
    test('let statement', () => {
        const program = new Program([
            new LetStatement({
                token: new Token(Token.LET, 'let'),
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

        assert.strictEqual(program.toString(), 'let var = anotherVar');
    });

    test('hash literal', () => {
        const program = new Program([
            new ExpressionStatement({
                token: new Token(Token.LBRACE, '{'),
                expression: new HashLiteral({
                    token: new Token(Token.LBRACE, '{'),
                    pairs: [
                        {
                            key: new Identifier({ token: new Token(Token.IDENT, 'a'), value: 'a' }),
                            value: new Identifier({ token: new Token(Token.IDENT, '1'), value: '1' }),
                        },
                        {
                            key: new Identifier({ token: new Token(Token.IDENT, 'b'), value: 'b' }),
                            value: new Identifier({ token: new Token(Token.IDENT, '2'), value: '2' }),
                        },
                    ],
                }),
            }),
        ]);

        assert.strictEqual(program.toString(), '{ a: 1, b: 2 }');
    });
});
