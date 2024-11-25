import assert from 'node:assert';
import { test, describe } from 'node:test';
import Lexer from '../src/lexer';
import Parser from '../src/parser';
import { MonkeyObject, MonkeyInteger, MonkeyBoolean, NULL, MonkeyError, MonkeyFunction, MonkeyString } from '../src/object';
import { evaluate } from '../src/evaluator';
import { Environment } from '../src/environment';

function testEval(input: string): MonkeyObject {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    return evaluate(program, new Environment());
}

function testIntegerObject(obj: MonkeyObject, expected: number) {
    assert.ok(obj instanceof MonkeyInteger, 'obj is not Integer');
    assert.strictEqual(obj.value, expected);
}

function testBooleanObject(obj: MonkeyObject, expected: boolean) {
    assert.ok(obj instanceof MonkeyBoolean, 'obj is not Boolean');
    assert.strictEqual(obj.value, expected);
}

function testStringObject(obj: MonkeyObject, expected: string) {
    assert.ok(obj instanceof MonkeyString, 'obj is not String');
    assert.strictEqual(obj.value, expected);
}

function testNullObject(obj: MonkeyObject) {
    assert.strictEqual(obj, NULL);
}

describe('evaluator', () => {
    test('integer', () => {
        const tests = [
            { input: '5', expected: 5 },
            { input: '10', expected: 10 },
            { input: '-5', expected: -5 },
            { input: '-10', expected: -10 },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testIntegerObject(evaluated, test.expected);
        }
    });

    test('boolean', () => {
        const tests = [
            { input: 'true', expected: true },
            { input: 'false', expected: false },
            { input: '1 < 2', expected: true },
            { input: '1 > 2', expected: false },
            { input: '1 == 1', expected: true },
            { input: '1 != 2', expected: true },
            { input: '1 < 1', expected: false },
            { input: '1 > 1', expected: false },
            { input: '1 == 2', expected: false },
            { input: '1 != 1', expected: false },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testBooleanObject(evaluated, test.expected);
        }
    });

    test('bang operator', () => {
        const tests = [
            { input: '!true', expected: false },
            { input: '!false', expected: true },
            { input: '!5', expected: false },
            { input: '!!true', expected: true },
            { input: '!!false', expected: false },
            { input: '!!5', expected: true },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testBooleanObject(evaluated, test.expected);
        }
    });

    test('integer expression', () => {
        const tests = [
            { input: '5', expected: 5 },
            { input: '10', expected: 10 },
            { input: '-5', expected: -5 },
            { input: '-10', expected: -10 },
            { input: '5 + 5 + 5 + 5 - 10', expected: 10 },
            { input: '2 * 2 * 2 * 2 * 2', expected: 32 },
            { input: '-50 + 100 + -50', expected: 0 },
            { input: '5 * 2 + 10', expected: 20 },
            { input: '5 + 2 * 10', expected: 25 },
            { input: '20 + 2 * -10', expected: 0 },
            { input: '50 / 2 * 2 + 10', expected: 60 },
            { input: '2 * (5 + 10)', expected: 30 },
            { input: '3 * 3 * 3 + 10', expected: 37 },
            { input: '3 * (3 * 3) + 10', expected: 37 },
            { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10', expected: 50 },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testIntegerObject(evaluated, test.expected);
        }
    });

    test('boolean expression', () => {
        const tests = [
            { input: 'true == true', expected: true },
            { input: 'true == false', expected: false },
            { input: 'false == false', expected: true },
            { input: 'false == true', expected: false },
            { input: 'true != false', expected: true },
            { input: '(1 < 2) == true', expected: true },
            { input: '(1 < 2) == false', expected: false },
            { input: '(1 > 2) == true', expected: false },
            { input: '(1 > 2) == false', expected: true },
            { input: '"a" + "bc" == "abc"', expected: true },
            { input: '"a" + "b\\"c" == "ab\\"c"', expected: true },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testBooleanObject(evaluated, test.expected);
        }
    });

    test('string expression', () => {
        const tests = [
            { input: '"Hello World"', expected: 'Hello World' },
            { input: '"七七四十九 八八六十四 九九八十一"', expected: '七七四十九 八八六十四 九九八十一' },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testStringObject(evaluated, test.expected);
        }
    });

    test('string concatenation', () => {
        const test = '"1" + "23" + "456"';
        const evaluated = testEval(test);
        testStringObject(evaluated, '123456');
    });

    test('if else expressions', () => {
        const tests = [
            { input: 'if (true) { 10 }', expected: 10 },
            { input: 'if (false) { 10 } else { 20 }', expected: 20 },
            { input: 'if (1 < 2) { 10 }', expected: 10 },
            { input: 'if (1 > 2) { 10 }', expected: null },
            { input: 'if (1 > 2) { 10 } else { 20 }', expected: 20 },
            { input: 'if (1 == 1) { 10 }', expected: 10 },
            { input: 'if (1 != 1) { 10 }', expected: null },
            { input: 'if (1 != 1) { 10 } else { 20 }', expected: 20 },
            { input: 'if (1 == 1) { if (1 > 2) { 10 } else { 20 } }', expected: 20 },
            { input: 'if (1 == 1) { if (1 < 2) { 10 } else { 20 } }', expected: 10 },
            { input: 'if (1 == 1) { if (1 > 2) { 10 } else { 20 } } else { 30 }', expected: 20 },
            { input: 'if (1 == 1) { if (1 < 2) { 10 } else { 20 } } else { 30 }', expected: 10 },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            if (test.expected === null) {
                testNullObject(evaluated);
            } else {
                testIntegerObject(evaluated, test.expected);
            }
        }
    });

    test('return', () => {
        const tests = [
            { input: 'return 10;', expected: 10 },
            { input: 'return 3; 9;', expected: 3 },
            { input: 'return 2 * 4; 9;', expected: 8 },
            { input: '9; return 2 * 7; 9;', expected: 14 },
            {
                input: `
                    if (10 > 1) {
                        if (10 > 1) {
                            return 10;
                        }
                        return 1;
                    }
                `,
                expected: 10,
            },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testIntegerObject(evaluated, test.expected);
        }
    });

    test('error handler', () => {
        const tests = [
            { input: '5 + true;', expected: 'type mismatch: INTEGER + BOOLEAN' },
            { input: '5 + true; 5;', expected: 'type mismatch: INTEGER + BOOLEAN' },
            { input: '-true;', expected: 'unknown operator: -BOOLEAN' },
            { input: 'true + false;', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
            { input: '5; true + false; 5;', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
            { input: 'if (10 > 1) { true + false; }', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
            {
                input: `
                    if (10 > 1) {
                        if (10 > 1) {
                            return true + false;
                        }
                        return 1;
                    }
                `,
                expected: 'unknown operator: BOOLEAN + BOOLEAN',
            },
            { input: '"a" - "b"', expected: 'unknown operator: STRING - STRING' },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            assert.ok(evaluated instanceof MonkeyError, `no error object returned. got=${JSON.stringify(evaluated)}`);
            assert.strictEqual(evaluated.message, test.expected, 'wrong error message');
        }
    });

    test('let statement', () => {
        const tests = [
            { input: 'let a = 5; a;', expected: 5 },
            { input: 'let a = 5 * 5; a;', expected: 25 },
            { input: 'let a = 6; let b = a; b;', expected: 6 },
            { input: 'let a = 7; let b = a; let c = a + b + 5; c;', expected: 19 },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testIntegerObject(evaluated, test.expected);
        }
    });

    test('function', () => {
        const input = 'fn(x) { x + 2; };';
        const evaluated = testEval(input);
        assert.ok(evaluated instanceof MonkeyFunction, `object not a function. got=${JSON.stringify(evaluated)}`);
        assert.strictEqual(evaluated.parameters.length, 1, `function has wrong parameters. parameters=${JSON.stringify(evaluated.parameters)}`);
        assert.strictEqual(evaluated.parameters[0].toString(), 'x', `parameter is not 'x'. got=${evaluated.parameters[0].toString()}`);
        assert.strictEqual(evaluated.body.toString(), '{(x + 2)}', `body is not {(x + 2)}. got=${evaluated.body.toString()}`);
    });

    test('function application', () => {
        const tests = [
            { input: 'let identity = fn(x) { x; }; identity(5);', expected: 5 },
            { input: 'let identity = fn(x) { return x; }; identity(6);', expected: 6 },
            { input: 'let double = fn(x) { x * 2; }; double(7);', expected: 14 },
            { input: 'let add = fn(x, y) { x + y; }; add(8, 9);', expected: 17 },
            { input: 'let add = fn(x, y) { x + y; }; add(10 + 11, add(12, 13));', expected: 46 },
            { input: 'fn(x) { x; }(14)', expected: 14 },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testIntegerObject(evaluated, test.expected);
        }
    });

    test('closures', () => {
        const input = `
            let newAdder = fn(x) {
                fn(y) { x + y };
            };
            let addTwo = newAdder(2);
            addTwo(3);
        `;
        const evaluated = testEval(input);
        testIntegerObject(evaluated, 5);
    });
});
