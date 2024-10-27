import assert from 'node:assert';
import { test, describe } from 'node:test';
import {
    BooleanLiteral,
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

    test('boolean literal expression', () => {
        const input = `
            true;
            false;
        `;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 2);

        testBooleanLiteral((program.statements[0] as ExpressionStatement).expression!, true);
        testBooleanLiteral((program.statements[1] as ExpressionStatement).expression!, false);
    });

    test('prefix expressions', () => {
        const tests = [
            { input: '!5', operator: '!', integerValue: 5 },
            { input: '-15', operator: '-', integerValue: 15 },
            { input: '!true', operator: '!', booleanValue: true },
            { input: '!false', operator: '!', booleanValue: false },
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

            if (t.integerValue) {
                testIntegerLiteral(expression.right!, t.integerValue);
            } else if (t.booleanValue) {
                testBooleanLiteral(expression.right!, t.booleanValue);
            }
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
            { input: 'true == true', leftValue: true, operator: '==', rightValue: true },
            { input: 'true != false', leftValue: true, operator: '!=', rightValue: false },
            { input: 'false == false', leftValue: false, operator: '==', rightValue: false },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            checkParserErrors(parser);

            assert.strictEqual(program.statements.length, 1);

            const statement = program.statements[0];
            assert.ok(statement instanceof ExpressionStatement);
            const expression = (statement as ExpressionStatement).expression!;
            testInfixExpression(expression, t.leftValue, t.operator, t.rightValue);
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
            { input: 'true', expected: 'true' },
            { input: 'false', expected: 'false' },
            { input: '3 > 5 == false', expected: '((3 > 5) == false)' },
            { input: '3 < 5 == true', expected: '((3 < 5) == true)' },
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

function testBooleanLiteral(expression: Expression, value: boolean) {
    assert.ok(expression instanceof BooleanLiteral);
    assert.strictEqual((expression as BooleanLiteral).value, value);
    assert.strictEqual((expression as BooleanLiteral).tokenLiteral(), value.toString());
}

function testIdentifier(expression: Expression, value: string) {
    assert.ok(expression instanceof Identifier);
    assert.strictEqual((expression as Identifier).value, value);
    assert.strictEqual((expression as Identifier).tokenLiteral(), value);
}

function testLiteralExpression(expression: Expression, expected: any) {
    switch (typeof expected) {
        case 'number':
            testIntegerLiteral(expression, expected);
            break;
        case 'string':
            testIdentifier(expression, expected);
            break;
        case 'boolean':
            testBooleanLiteral(expression, expected);
            break;
        default:
            assert.fail(`type of expression not handled. got=${typeof expected}`);
    }
}

function testInfixExpression(expression: Expression, left: any, operator: string, right: any) {
    assert.ok(expression instanceof InfixExpression);
    testLiteralExpression((expression as InfixExpression).left, left);
    assert.strictEqual((expression as InfixExpression).operator, operator);
    testLiteralExpression((expression as InfixExpression).right!, right);
}
