import assert from 'node:assert';
import { test, describe } from 'node:test';
import Token from '../src/token';
import Lexer from '../src/lexer';

type ExpectedToken = {
    expectedType: Token['type'];
    expectedLiteral: string;
};

function assertTokens(input: string, tests: ExpectedToken[]) {
    const l = new Lexer(input);

    for (const t of tests) {
        const token = l.nextToken();
        assert.strictEqual(token.type, t.expectedType);
        assert.strictEqual(token.literal, t.expectedLiteral);
    }
}

describe('lexer', () => {
    test('basic symbols', () => {
        const input = '=+(){}';

        const tests: ExpectedToken[] = [
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.PLUS, expectedLiteral: '+' },
            { expectedType: Token.LPAREN, expectedLiteral: '(' },
            { expectedType: Token.RPAREN, expectedLiteral: ')' },
            { expectedType: Token.LBRACE, expectedLiteral: '{' },
            { expectedType: Token.RBRACE, expectedLiteral: '}' },
            { expectedType: Token.EOF, expectedLiteral: '' },
        ];

        assertTokens(input, tests);
    });

    test('identifier and operator', () => {
        const input = `let five = 5;
            let ten = 10;
            let add = fn(x, y) {
                x + y;
            }

            let result = add(five, ten);

            !-/*5
            5 < 10 > 5

            if (5 < 10) {
                return true;
            } else {
                return false;
            }

            10 == 10
            10 != 9`;

        const tests: ExpectedToken[] = [
            // let five = 5;
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'five' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.INT, expectedLiteral: '5' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },

            // let ten = 10;
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'ten' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },

            // let add = fn(x, y) {
            //     x + y;
            // }
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'add' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.FUNCTION, expectedLiteral: 'fn' },
            { expectedType: Token.LPAREN, expectedLiteral: '(' },
            { expectedType: Token.IDENT, expectedLiteral: 'x' },
            { expectedType: Token.COMMA, expectedLiteral: ',' },
            { expectedType: Token.IDENT, expectedLiteral: 'y' },
            { expectedType: Token.RPAREN, expectedLiteral: ')' },
            { expectedType: Token.LBRACE, expectedLiteral: '{' },
            { expectedType: Token.IDENT, expectedLiteral: 'x' },
            { expectedType: Token.PLUS, expectedLiteral: '+' },
            { expectedType: Token.IDENT, expectedLiteral: 'y' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.RBRACE, expectedLiteral: '}' },

            // let result = add(five, ten);
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'result' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.IDENT, expectedLiteral: 'add' },
            { expectedType: Token.LPAREN, expectedLiteral: '(' },
            { expectedType: Token.IDENT, expectedLiteral: 'five' },
            { expectedType: Token.COMMA, expectedLiteral: ',' },
            { expectedType: Token.IDENT, expectedLiteral: 'ten' },
            { expectedType: Token.RPAREN, expectedLiteral: ')' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },

            // !-/*5
            { expectedType: Token.BANG, expectedLiteral: '!' },
            { expectedType: Token.MINUS, expectedLiteral: '-' },
            { expectedType: Token.SLASH, expectedLiteral: '/' },
            { expectedType: Token.ASTERISK, expectedLiteral: '*' },
            { expectedType: Token.INT, expectedLiteral: '5' },

            // 5 < 10 > 5
            { expectedType: Token.INT, expectedLiteral: '5' },
            { expectedType: Token.LT, expectedLiteral: '<' },
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.GT, expectedLiteral: '>' },
            { expectedType: Token.INT, expectedLiteral: '5' },

            // if (5 < 10) {
            //     return true;
            // } else {
            //     return false;
            // }
            { expectedType: Token.IF, expectedLiteral: 'if' },
            { expectedType: Token.LPAREN, expectedLiteral: '(' },
            { expectedType: Token.INT, expectedLiteral: '5' },
            { expectedType: Token.LT, expectedLiteral: '<' },
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.RPAREN, expectedLiteral: ')' },
            { expectedType: Token.LBRACE, expectedLiteral: '{' },
            { expectedType: Token.RETURN, expectedLiteral: 'return' },
            { expectedType: Token.TRUE, expectedLiteral: 'true' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.RBRACE, expectedLiteral: '}' },
            { expectedType: Token.ELSE, expectedLiteral: 'else' },
            { expectedType: Token.LBRACE, expectedLiteral: '{' },
            { expectedType: Token.RETURN, expectedLiteral: 'return' },
            { expectedType: Token.FALSE, expectedLiteral: 'false' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.RBRACE, expectedLiteral: '}' },

            // 10 == 10
            // 10 != 9
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.EQ, expectedLiteral: '==' },
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.NOT_EQ, expectedLiteral: '!=' },
            { expectedType: Token.INT, expectedLiteral: '9' },
        ];

        assertTokens(input, tests);
    });

    test('string', () => {
        const input = `
            "foobar"
            "foo bar"
            "dog\\"cat"
            "dog\\cat"
            "dog\\\\cat"
            "dog\\ncat"
            "dog\\tcat"
        `;

        const tests = [
            { expectedType: Token.STRING, expectedLiteral: 'foobar' },
            { expectedType: Token.STRING, expectedLiteral: 'foo bar' },
            { expectedType: Token.STRING, expectedLiteral: 'dog"cat' },
            { expectedType: Token.STRING, expectedLiteral: 'dog\\cat' },
            { expectedType: Token.STRING, expectedLiteral: 'dog\\cat' },
            { expectedType: Token.STRING, expectedLiteral: 'dog\ncat' },
            { expectedType: Token.STRING, expectedLiteral: 'dog\tcat' },
            { expectedType: Token.EOF, expectedLiteral: '' },
        ];

        assertTokens(input, tests);
    });

    test('array', () => {
        const input = '[a, 2];';
        const tests = [
            { expectedType: Token.LBRACKET, expectedLiteral: '[' },
            { expectedType: Token.IDENT, expectedLiteral: 'a' },
            { expectedType: Token.COMMA, expectedLiteral: ',' },
            { expectedType: Token.INT, expectedLiteral: '2' },
            { expectedType: Token.RBRACKET, expectedLiteral: ']' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.EOF, expectedLiteral: '' },
        ];

        assertTokens(input, tests);
    });

    test('map', () => {
        const input = '{"foo": "bar"}';
        const tests = [
            { expectedType: Token.LBRACE, expectedLiteral: '{' },
            { expectedType: Token.STRING, expectedLiteral: 'foo' },
            { expectedType: Token.COLON, expectedLiteral: ':' },
            { expectedType: Token.STRING, expectedLiteral: 'bar' },
            { expectedType: Token.RBRACE, expectedLiteral: '}' },
            { expectedType: Token.EOF, expectedLiteral: '' },
        ];

        assertTokens(input, tests);
    });

    test('comment', () => {
        const input = `
            // BEGIN
            let a = 10; // a is ten
            let b = 20;
            // c is here
            let c = 30;
            // END
        `;
        const tests = [
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'a' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.INT, expectedLiteral: '10' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'b' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.INT, expectedLiteral: '20' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.LET, expectedLiteral: 'let' },
            { expectedType: Token.IDENT, expectedLiteral: 'c' },
            { expectedType: Token.ASSIGN, expectedLiteral: '=' },
            { expectedType: Token.INT, expectedLiteral: '30' },
            { expectedType: Token.SEMICOLON, expectedLiteral: ';' },
            { expectedType: Token.EOF, expectedLiteral: '' },
        ];

        assertTokens(input, tests);
    });
});
