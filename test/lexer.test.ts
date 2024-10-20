import assert from 'node:assert';
import { test, describe, before, after, it } from 'node:test';
import Token from '../src/token';
import Lexer from '../src/lexer';

describe('lexer', () => {
    test('nextToken', () => {
        const input = '=+(){}';

        const tests = [
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.PLUS, expectedLiteral: '+' },
            { expectedType: Token.LPAREN, expectedLiteral: '(' },
            { expectedType: Token.RPAREN, expectedLiteral: ')' },
            { expectedType: Token.LBRACE, expectedLiteral: '{' },
            { expectedType: Token.RBRACE, expectedLiteral: '}' },
            { expectedType: Token.EOF, expectedLiteral: '' },
        ];

        const l = new Lexer(input);

        for (const t of tests) {
            const tok = l.nextToken();
            assert.strictEqual(tok.type, t.expectedType);
            assert.strictEqual(tok.literal, t.expectedLiteral);
        }
    });
});
