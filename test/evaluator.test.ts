import assert from 'node:assert';
import { test, describe } from 'node:test';
import Lexer from '../src/lexer';
import Parser from '../src/parser';
import { MonkeyObject, Integer, Boolean } from '../src/object';
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

describe('evaluator', () => {
    test('integer', () => {
        const tests = [
            { input: '5', expected: 5 },
            { input: '10', expected: 10 },
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
        ];

        for (const test of tests) {
            const evaluated = testEval(test.input);
            testBooleanObject(evaluated, test.expected);
        }
    });
});
