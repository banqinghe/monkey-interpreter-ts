import assert from 'node:assert';
import { test, describe } from 'node:test';
import Lexer from '../src/lexer';
import Parser from '../src/parser';
import { MonkeyObject, Integer, Boolean, NULL } from '../src/object';
import { evaluate } from '../src/evaluator';

function testEval(input: string): MonkeyObject {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    return evaluate(program);
}

function testIntegerObject(obj: MonkeyObject, expected: number) {
    assert.ok(obj instanceof Integer, 'obj is not Integer');
    assert.strictEqual(obj.value, expected);
}

function testBooleanObject(obj: MonkeyObject, expected: boolean) {
    assert.ok(obj instanceof Boolean, 'obj is not Boolean');
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
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testBooleanObject(evaluated, test.expected);
        }
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
});
