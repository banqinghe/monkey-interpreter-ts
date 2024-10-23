import assert from 'node:assert';
import { test, describe } from 'node:test';
import { LetStatement } from '../src/ast';
import Lexer from '../src/lexer';
import Parser from '../src/parser';

function checkParserErrors(parser: Parser) {
    const errors = parser.errors;

    for (const error of errors) {
        console.error(`Parser error: ${error}`);
    }

    assert.strictEqual(errors.length, 0, `Parser has ${errors.length} errors`);
}

describe('parser', () => {
    test('let statement', () => {
        const input = `
            let x = 5;
            let y = 10;
            let foobar = 838383;
        `;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.ok(Array.isArray(program.statements), 'program.statements should be a array');
        assert.strictEqual(program.statements.length, 3, 'The length of program.statements should be 3');

        const tests = ['x', 'y', 'foobar'];

        const testLetStatement = (statement: LetStatement, name: string) => {
            assert.strictEqual(statement.tokenLiteral(), 'let');
            assert.strictEqual(statement.name.value, name);
            assert.strictEqual(statement.name.tokenLiteral(), name);
        };

        for (let i = 0; i < tests.length; i++) {
            const statement = program.statements[i];
            assert.ok(statement instanceof LetStatement);
            testLetStatement(statement, tests[i]);
        }
    });
});
