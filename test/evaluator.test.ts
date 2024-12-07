import assert from 'node:assert';
import { test, describe } from 'node:test';
import Lexer from '../src/lexer';
import Parser from '../src/parser';
import {
    MonkeyObject,
    MonkeyInteger,
    MonkeyBoolean,
    MonkeyError,
    MonkeyFunction,
    MonkeyString,
    MonkeyArray,
    MonkeyHash,
    NULL,
    HashKey,
    TRUE,
    FALSE,
} from '../src/object';
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

function testArrayObject(obj: MonkeyObject, expected: any[]) {
    assert.ok(obj instanceof MonkeyArray, 'obj is not Array');

    assert.strictEqual(obj.elements.length, expected.length);
    for (let i = 0; i < expected.length; i++) {
        switch (typeof expected[i]) {
            case 'number':
                testIntegerObject(obj.elements[i], expected[i]);
                break;
            case 'string':
                testStringObject(obj.elements[i], expected[i]);
                break;
            case 'boolean':
                testBooleanObject(obj.elements[i], expected[i]);
                break;
            case 'object':
                if (Array.isArray(expected[i])) {
                    testArrayObject(obj.elements[i], expected[i]);
                    break;
                } else {
                    throw new Error(`unexpected type: ${typeof expected[i]}`);
                }
            default:
                throw new Error(`unexpected type: ${typeof expected[i]}`);
        }
    }
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
            { input: '{"name": "Monkey"}[fn(x) {x}];', expected: 'unusable as hash key: FUNCTION' },
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

    test('builtin functions', () => {
        const tests = [
            { input: 'len("")', expected: 0 },
            { input: 'len("four")', expected: 4 },
            { input: 'len("hello world")', expected: 11 },
            { input: 'len(1)', expected: 'argument to `len` not supported, got=INTEGER' },
            { input: 'len("one", "two")', expected: 'wrong number of arguments. got=2, want=1' },
            { input: 'len([1, 2, 3])', expected: 3 },
            { input: 'len([])', expected: 0 },
            { input: 'first([])', expected: NULL },
            { input: 'first([1, 2, 3])', expected: 1 },
            { input: 'last([])', expected: NULL },
            { input: 'last([1, 2, 3])', expected: 3 },
            { input: 'rest([])', expected: NULL },
            { input: 'rest([1, 2, 3])', expected: [2, 3] },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);

            if (evaluated.type() === 'INTEGER') {
                testIntegerObject(evaluated, test.expected as number);
            } else if (evaluated.type() === 'NULL') {
                assert.strictEqual(evaluated, NULL, `object is not NULL. got=${JSON.stringify(evaluated)}`);
            } else if (Array.isArray(test.expected)) {
                testArrayObject(evaluated, test.expected);
            } else {
                assert.ok(evaluated instanceof MonkeyError, `no error object returned. got=${JSON.stringify(evaluated)}`);
                assert.strictEqual(evaluated.message, test.expected, 'wrong error message');
            }
        }
    });

    test('builtin function - push', () => {
        const input = `
            let a = [1, 2];
            let b = push(a, 3);
            [a, b];
        `;
        const evaluated = testEval(input);

        testArrayObject(evaluated, [[1, 2], [1, 2, 3]]);
    });

    test('array literal', () => {
        const input = '[1, 2 * 2, 3 + 3]';
        const evaluated = testEval(input);
        assert.ok(evaluated instanceof MonkeyArray, `object not Array. got=${JSON.stringify(evaluated)}`);
        assert.strictEqual(evaluated.elements.length, 3, `array has wrong num of elements. got=${evaluated.elements.length}`);
        testIntegerObject(evaluated.elements[0], 1);
        testIntegerObject(evaluated.elements[1], 4);
        testIntegerObject(evaluated.elements[2], 6);
    });

    test('hash literals', () => {
        const input = `
            let two = "er";
            {
                "one": 10 - 9,
                two: 1 + 1,
                "thr" + "ee": 6 / 2,
                4: 4,
                true: 5,
                false: 6
            }
        `;

        const evaluated = testEval(input);
        assert.ok(evaluated instanceof MonkeyHash, `object is not Hash. got=${JSON.stringify(evaluated)}`);

        const expected: Array<[HashKey, number]> = [
            [new MonkeyString('one').hashKey(), 1],
            [new MonkeyString('er').hashKey(), 2],
            [new MonkeyString('three').hashKey(), 3],
            [new MonkeyInteger(4).hashKey(), 4],
            [TRUE.hashKey(), 5],
            [FALSE.hashKey(), 6],
        ];

        assert.strictEqual(evaluated.pairs.size, expected.length, `hash has wrong num of pairs. got=${evaluated.pairs.size}`);

        for (const [expectedKey, expectedValue] of expected) {
            const pair = evaluated.pairs.get(expectedKey);
            assert.ok(pair, `no pair for given key in pairs`);
            testIntegerObject(pair.value, expectedValue);
        }
    });

    test('array index expression', () => {
        const tests = [
            { input: '[1, 2, 3][0]', expected: 1 },
            { input: '[1, 2, 3][1]', expected: 2 },
            { input: '[1, 2, 3][2]', expected: 3 },
            { input: 'let i = 0; [1][i];', expected: 1 },
            { input: '[1, 2, 3][1 + 1];', expected: 3 },
            { input: 'let myArray = [1, 2, 3]; myArray[2];', expected: 3 },
            { input: 'let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];', expected: 6 },
            { input: 'let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i];', expected: 2 },
            { input: '[1, 2, 3][3]', expected: null },
            { input: '[1, 2, 3][-1]', expected: null },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            if (typeof test.expected === 'number') {
                testIntegerObject(evaluated, test.expected);
            } else {
                testNullObject(evaluated);
            }
        }
    });

    test('hash index expression', () => {
        const tests = [
            { input: '{"foo": 5}["foo"]', expected: 5 },
            { input: '{"foo": 5}["bar"]', expected: null },
            { input: 'let key = "foo"; {"foo": 6}[key]', expected: 6 },
            { input: '{}["bar"]', expected: null },
            { input: '{5: 7}[5]', expected: 7 },
            { input: '{true: 8}[true]', expected: 8 },
            { input: '{false: 9}[false]', expected: 9 },
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            if (typeof test.expected === 'number') {
                testIntegerObject(evaluated, test.expected);
            } else {
                testNullObject(evaluated);
            }
        }
    });
});
