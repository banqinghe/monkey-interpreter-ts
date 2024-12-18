import assert from 'node:assert';
import { test, describe } from 'node:test';
import {
    ArrayLiteral,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    HashLiteral,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    ReturnStatement,
    StringLiteral,
} from '../src/ast';
import Lexer from '../src/lexer';
import Parser from '../src/parser';

describe('parser', () => {
    test('let statement', () => {
        const tests = [
            { input: 'let x = 5;', expectedIdentifier: 'x', expectedValue: '5' },
            { input: 'let y = 10;', expectedIdentifier: 'y', expectedValue: '10' },
            { input: 'let foobar = 838383;', expectedIdentifier: 'foobar', expectedValue: '838383' },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();
            checkParserErrors(parser);

            assert.ok(Array.isArray(program.statements), 'program.statements should be a array');
            assert.strictEqual(program.statements.length, 1, 'The length of program.statements should be 1');

            const letStatement = program.statements[0] as LetStatement;

            testLiteralExpression(letStatement.name, t.expectedIdentifier);
            testLiteralExpression(letStatement.value, t.expectedValue);
        }
    });

    test('return statement', () => {
        const tests = [
            { input: 'return 5', expectedValue: '5' },
            { input: 'return 10', expectedValue: '10' },
            { input: 'return 838383', expectedValue: '838383' },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);

            const program = parser.parseProgram();
            checkParserErrors(parser);

            assert.ok(Array.isArray(program.statements), 'program.statements should be a array');
            assert.strictEqual(program.statements.length, 1, 'The length of program.statements should be 1');

            const returnStatement = program.statements[0] as ReturnStatement;

            testLiteralExpression(returnStatement.returnValue, t.expectedValue);
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
        assert.strictEqual((statement.expression as IntegerLiteral).value, '5');
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

    test('string literal expression', () => {
        const input = '"hello world"';

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);
        const statement = program.statements[0] as ExpressionStatement;

        assert.strictEqual((statement.expression as StringLiteral).value, 'hello world');
    });

    test('prefix expressions', () => {
        const tests = [
            { input: '!5', operator: '!', integerValue: '5' },
            { input: '-15', operator: '-', integerValue: '15' },
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

            testLiteralExpression(expression.right!, t.integerValue || t.booleanValue);
        }
    });

    test('infix expressions - integer', () => {
        const tests = [
            { input: '10086 + 5', leftValue: '10086', operator: '+', rightValue: '5' },
            { input: '5 - 5', leftValue: '5', operator: '-', rightValue: '5' },
            { input: '5 * 5', leftValue: '5', operator: '*', rightValue: '5' },
            { input: '5 / 5', leftValue: '5', operator: '/', rightValue: '5' },
            { input: '5 > 5', leftValue: '5', operator: '>', rightValue: '5' },
            { input: '5 < 5', leftValue: '5', operator: '<', rightValue: '5' },
            { input: '5 == 5', leftValue: '5', operator: '==', rightValue: '5' },
            { input: '5 != 5', leftValue: '5', operator: '!=', rightValue: '5' },
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
            { input: '1 + (2 + 3) + 4', expected: '((1 + (2 + 3)) + 4)' },
            { input: '(5 + 5) * 2', expected: '((5 + 5) * 2)' },
            { input: '2 / (5 + 5)', expected: '(2 / (5 + 5))' },
            { input: '(5 + 5) * 2 * (5 + 5)', expected: '(((5 + 5) * 2) * (5 + 5))' },
            { input: '-(5 + 5)', expected: '(-(5 + 5))' },
            { input: '!(true == true)', expected: '(!(true == true))' },
            { input: 'a + add(b * c) + d', expected: '((a + add((b * c))) + d)' },
            { input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))' },
            { input: 'add(a + b + c * d / f + g)', expected: 'add((((a + b) + ((c * d) / f)) + g))' },
            { input: '[1, 2, 3][1]', expected: '([1, 2, 3][1])' },
            { input: 'a[1 + 1]', expected: '(a[(1 + 1)])' },
            { input: 'arr[2 * 3]', expected: '(arr[(2 * 3)])' },
            { input: 'arr[2 + 3][1]', expected: '((arr[(2 + 3)])[1])' },
            { input: 'arr[2 + 3][1 + 1]', expected: '((arr[(2 + 3)])[(1 + 1)])' },
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

    test('if expression', () => {
        const input = 'if (x < y) { x }';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        assert.strictEqual(program.statements.length, 1);
        assert.ok(program.statements[0] instanceof ExpressionStatement);
        const statement = program.statements[0] as ExpressionStatement;

        assert.ok(statement.expression instanceof IfExpression);
        const expression = statement.expression as IfExpression;
        testInfixExpression(expression.condition, 'x', '<', 'y');
        assert.strictEqual(expression.consequence.statements.length, 1);
        const consequence = expression.consequence.statements[0];
        assert.ok(consequence instanceof ExpressionStatement);
        const consequenceExpression = (consequence as ExpressionStatement).expression;
        assert.ok(consequenceExpression instanceof Identifier);
        assert.strictEqual((consequenceExpression as Identifier).value, 'x');
        assert.strictEqual(expression.alternative, undefined);
    });

    test('if else expression', () => {
        const input = 'if (x < y) { x } else { y }';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        assert.strictEqual(program.statements.length, 1);
        assert.ok(program.statements[0] instanceof ExpressionStatement);
        const statement = program.statements[0] as ExpressionStatement;

        assert.ok(statement.expression instanceof IfExpression);
        const expression = statement.expression as IfExpression;
        testInfixExpression(expression.condition, 'x', '<', 'y');
        assert.strictEqual(expression.consequence.statements.length, 1);

        const consequence = expression.consequence.statements[0];
        assert.ok(consequence instanceof ExpressionStatement);
        const consequenceExpression = (consequence as ExpressionStatement).expression;
        assert.ok(consequenceExpression instanceof Identifier);
        assert.strictEqual((consequenceExpression as Identifier).value, 'x');

        const alternative = expression.alternative?.statements[0];
        assert.ok(alternative instanceof ExpressionStatement);
        const alternativeExpression = (alternative as ExpressionStatement).expression;
        assert.ok(alternativeExpression instanceof Identifier);
        assert.strictEqual((alternativeExpression as Identifier).value, 'y');
    });

    test('function literal expression', () => {
        const tests = [
            { input: 'fn() {};', expectedParams: [] },
            { input: 'fn(x) {};', expectedParams: ['x'] },
            { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            checkParserErrors(parser);
            assert.strictEqual(program.statements.length, 1);

            assert.ok(program.statements[0] instanceof ExpressionStatement);
            const statement = program.statements[0] as ExpressionStatement;

            assert.ok(statement.expression instanceof FunctionLiteral);
            const functionLiteral = statement.expression as FunctionLiteral;
            assert.strictEqual(functionLiteral.parameters.length, t.expectedParams.length);

            for (let i = 0; i < t.expectedParams.length; i++) {
                testLiteralExpression(functionLiteral.parameters[i], t.expectedParams[i]);
            }
            assert.strictEqual(functionLiteral.body.statements.length, 0);
        }
    });

    test('function call', () => {
        const tests = [
            { input: 'foo();', expectFunc: 'foo', expectedParams: [] },
            { input: 'add(1, 2 * 3, 4 + 5);', expectFunc: 'add', expectedParams: ['1', '(2 * 3)', '(4 + 5)'] },
            { input: 'minus(1, fn (){});', expectFunc: 'minus', expectedParams: ['1', 'fn() {}'] },
            { input: 'fn(a, b) {}(1, 2)', expectFunc: 'fn(a, b) {}', expectedParams: ['1', '2'] },
        ];

        for (const t of tests) {
            const lexer = new Lexer(t.input);
            const parser = new Parser(lexer);
            const program = parser.parseProgram();
            checkParserErrors(parser);

            assert.strictEqual(program.statements.length, 1);

            const statement = program.statements[0] as ExpressionStatement;
            assert.ok(statement instanceof ExpressionStatement);
            const callExpression = statement.expression as CallExpression;
            assert.ok(callExpression instanceof CallExpression);

            if (callExpression.func instanceof Identifier) {
                testIdentifier(callExpression.func, t.expectFunc);
            } else {
                assert.strictEqual(callExpression.func.toString(), t.expectFunc);
            }

            assert.strictEqual(callExpression.args.length, t.expectedParams.length);

            for (let i = 0; i < t.expectedParams.length; i++) {
                // console.log(JSON.stringify(callExpression.args[i], null, 2) + '\n');
                assert.strictEqual(callExpression.args[i].toString(), t.expectedParams[i]);
            }
        }
    });

    test('array literal', () => {
        const input = '[1, 2 * 2, 3 + 3]';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);

        const statement = program.statements[0] as ExpressionStatement;
        assert.ok(statement instanceof ExpressionStatement);

        const array = statement.expression as ArrayLiteral;
        assert.ok(array instanceof ArrayLiteral);

        assert.strictEqual(array.elements.length, 3);
        testLiteralExpression(array.elements[0], '1');
        testInfixExpression(array.elements[1], '2', '*', '2');
        testInfixExpression(array.elements[2], '3', '+', '3');
    });

    test('hash literal', () => {
        const input = '{"one": 1, "two": 2, "three": 3}';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);

        const statement = program.statements[0] as ExpressionStatement;
        assert.ok(statement instanceof ExpressionStatement);

        const hash = statement.expression as HashLiteral;
        assert.ok(hash instanceof HashLiteral);

        const expected = [
            { key: 'one', value: '1' },
            { key: 'two', value: '2' },
            { key: 'three', value: '3' },
        ];

        for (let i = 0; i < expected.length; i++) {
            const key = hash.pairs[i].key;
            const value = hash.pairs[i].value;

            testStringLiteral(key, expected[i].key);
            testLiteralExpression(value, expected[i].value, true);
        }
    });

    test('empty hash literal', () => {
        const input = '{}';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);

        const statement = program.statements[0] as ExpressionStatement;
        assert.ok(statement instanceof ExpressionStatement);

        const hash = statement.expression as HashLiteral;
        assert.ok(hash instanceof HashLiteral);

        assert.strictEqual(hash.pairs.length, 0);
    });

    test('hash literal with expressions', () => {
        const input = '{"one": 0 + 1, "two": 10 - 8, "three": 15 / 5}';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);

        const statement = program.statements[0] as ExpressionStatement;
        assert.ok(statement instanceof ExpressionStatement);

        const hash = statement.expression as HashLiteral;
        assert.ok(hash instanceof HashLiteral);

        const expected = [
            { key: 'one', testValue: (exp: Expression) => testInfixExpression(exp, '0', '+', '1') },
            { key: 'two', testValue: (exp: Expression) => testInfixExpression(exp, '10', '-', '8') },
            { key: 'three', testValue: (exp: Expression) => testInfixExpression(exp, '15', '/', '5') },
        ];

        for (let i = 0; i < expected.length; i++) {
            const key = hash.pairs[i].key;
            const value = hash.pairs[i].value;
            testStringLiteral(key, expected[i].key);
            expected[i].testValue(value);
        }
    });

    test('index expression', () => {
        const input = 'arr[1 + 1];';
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);

        assert.strictEqual(program.statements.length, 1);

        const statement = program.statements[0] as ExpressionStatement;
        assert.ok(statement instanceof ExpressionStatement);

        const indexExpression = statement.expression as IndexExpression;
        assert.ok(indexExpression instanceof IndexExpression);

        testIdentifier(indexExpression.left, 'arr');
        testInfixExpression(indexExpression.index, '1', '+', '1');
    });
});

function checkParserErrors(parser: Parser) {
    const errors = parser.errors;

    for (const error of errors) {
        console.error(`Parser error: ${error}`);
    }

    assert.strictEqual(errors.length, 0, `Parser has ${errors.length} errors`);
}

function testIntegerLiteral(expression: Expression, value: string) {
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

function testStringLiteral(expression: Expression, value: string) {
    assert.ok(expression instanceof StringLiteral);
    assert.strictEqual((expression as StringLiteral).value, value);
    assert.strictEqual((expression as StringLiteral).tokenLiteral(), value);
}

function testLiteralExpression(expression: Expression, expected: any) {
    if (typeof expected === 'string' && /^\d+$/.test(expected)) {
        testIntegerLiteral(expression, expected);
        return;
    }

    switch (typeof expected) {
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
