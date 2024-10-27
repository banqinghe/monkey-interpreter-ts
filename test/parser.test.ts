import assert from 'node:assert';
import { test, describe } from 'node:test';
import {
    Expression,
    ExpressionStatement,
    Identifier,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
} from '../src/ast';
import Lexer from '../src/lexer';
import Parser from '../src/parser';

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
            assert.strictEqual(statement.name!.value, name);
            assert.strictEqual(statement.name!.tokenLiteral(), name);
        };

        for (let i = 0; i < tests.length; i++) {
            const statement = program.statements[i];
            assert.ok(statement instanceof LetStatement);
            testLetStatement(statement, tests[i]);
        }
    });

    test('return statement', () => {
        const input = `
            return 5;
            return 10;
            return 993 322;
        `;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 3, 'The length of program.statements should be 3');

        for (const statement of program.statements) {
            assert.strictEqual(statement.tokenLiteral(), 'return');
        }
    });

    test('identifier expression', () => {
        const input = 'foobar;';

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        // console.log(JSON.stringify(program, null, 4));

        assert.strictEqual(program.statements.length, 1);

        const statement = program.statements[0] as ExpressionStatement;

        assert.strictEqual(statement.tokenLiteral(), 'foobar');
        assert.strictEqual((statement.expression as Identifier).value, 'foobar');
    });

    test('integer literal expression', () => {
        const input = '5;';

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);
        const statement = program.statements[0] as ExpressionStatement;

        assert.strictEqual(statement.tokenLiteral(), '5');
        assert.strictEqual((statement.expression as IntegerLiteral).value, 5);
    });

    test('prefix expressions', () => {
        const tests = [
            {
                input: '!5',
                operator: '!',
                integerValue: 5,
            },
            {
                input: '-15',
                operator: '-',
                integerValue: 15,
            },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            checkParserErrors(parser);

            assert.strictEqual(program.statements.length, 1);

            const statement = program.statements[0];
            assert.ok(statement instanceof ExpressionStatement);

            const expression = (statement as ExpressionStatement).expression;
            assert.ok(expression instanceof PrefixExpression);

            assert.strictEqual(expression.operator, t.operator);

            testIntegerLiteral(expression.right!, t.integerValue);
        }
    });

    test('infix expressions - integer', () => {
        const tests = [
            { input: '10086 + 5', leftValue: 10086, operator: '+', rightValue: 5 },
            { input: '5 - 5', leftValue: 5, operator: '-', rightValue: 5 },
            { input: '5 * 5', leftValue: 5, operator: '*', rightValue: 5 },
            { input: '5 / 5', leftValue: 5, operator: '/', rightValue: 5 },
            { input: '5 > 5', leftValue: 5, operator: '>', rightValue: 5 },
            { input: '5 < 5', leftValue: 5, operator: '<', rightValue: 5 },
            { input: '5 == 5', leftValue: 5, operator: '==', rightValue: 5 },
            { input: '5 != 5', leftValue: 5, operator: '!=', rightValue: 5 },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            checkParserErrors(parser);

            assert.strictEqual(program.statements.length, 1);

            const statement = program.statements[0];
            assert.ok(statement instanceof ExpressionStatement);
            const expression = (statement as ExpressionStatement).expression;
            assert.ok(expression instanceof InfixExpression);
            assert.strictEqual((expression as InfixExpression).operator, t.operator);
            testIntegerLiteral((expression as InfixExpression).left, t.leftValue);
            testIntegerLiteral((expression as InfixExpression).right!, t.rightValue);
        }
    });

    test('operator precedence', () => {
        const tests = [
            { input: '-a * b', expected: '((-a) * b)' },
            { input: '!-a', expected: '(!(-a))' },
            { input: 'a + b + c', expected: '((a + b) + c)' },
            { input: 'a + b - c', expected: '((a + b) - c)' },
            { input: 'a * b * c', expected: '((a * b) * c)' },
            { input: 'a * b / c', expected: '((a * b) / c)' },
            { input: 'a + b / c', expected: '(a + (b / c))' },
            { input: 'a + b * c + d / e - f', expected: '(((a + (b * c)) + (d / e)) - f)' },
            { input: '3 + 4; -5 * 5', expected: '(3 + 4)\n((-5) * 5)' },
            { input: '5 > 4 == 3 < 4', expected: '((5 > 4) == (3 < 4))' },
            { input: '5 < 4 != 3 > 4', expected: '((5 < 4) != (3 > 4))' },
            { input: '3 + 4 * 5 == 3 * 1 + 4 * 5', expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))' },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            checkParserErrors(parser);
            const actual = program.toString();
            assert.strictEqual(actual, t.expected);
        }
    });
});

function checkParserErrors(parser: Parser) {
    const errors = parser.errors;

    for (const error of errors) {
        console.error(`Parser error: ${error}`);
    }

    assert.strictEqual(errors.length, 0, `Parser has ${errors.length} errors`);
}

function testIntegerLiteral(expression: Expression, value: number) {
    assert.ok(expression instanceof IntegerLiteral);
    assert.strictEqual((expression as IntegerLiteral).value, value);
    assert.strictEqual((expression as IntegerLiteral).tokenLiteral(), value.toString());
}
