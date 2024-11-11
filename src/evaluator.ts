import { BooleanLiteral, ExpressionStatement, IntegerLiteral, Node, PrefixExpression, Program, Statement } from './ast';
import { MonkeyObject, Integer, Null, Boolean } from './object';

const TRUE = new Boolean(true);
const FALSE = new Boolean(false);
const NULL = new Null();

export function evaluate(node: Node): MonkeyObject {
    if (node instanceof Program) {
        return evaluateStatements(node.statements);
    }

    if (node instanceof ExpressionStatement) {
        return evaluate(node.expression);
    }

    if (node instanceof IntegerLiteral) {
        return new Integer(node.value);
    }

    if (node instanceof BooleanLiteral) {
        return node.value ? TRUE : FALSE;
    }

    if (node instanceof PrefixExpression) {
        const right = evaluate(node.right);
        return evaluatePrefixExpression(node.operator, right);
    }

    throw new Error(`Unknown node type: ${node.type}`);
}

function evaluateStatements(statements: Statement[]): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of statements) {
        result = evaluate(statement);
    }

    return result;
}

function evaluatePrefixExpression(operator: string, right: MonkeyObject): MonkeyObject {
    if (operator === '!') {
        return evaluateBangOperatorExpression(right);
    } else if (operator === '-') {
        return evaluateMinusPrefixOperatorExpression(right);
    } else {
        throw new Error(`Unknown prefix operator: ${operator}`);
    }
}

function evaluateBangOperatorExpression(right: MonkeyObject): MonkeyObject {
    switch (right) {
        case TRUE:
            return FALSE;
        case FALSE:
            return TRUE;
        case NULL:
            return TRUE;
        default:
            return FALSE;
    }
}

function evaluateMinusPrefixOperatorExpression(right: MonkeyObject): MonkeyObject {
    if (!(right instanceof Integer)) {
        throw new Error(`Unknown operator: -${right.type}`);
    }

    return new Integer(-right.value);
}
