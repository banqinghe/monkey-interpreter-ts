import {
    BlockStatement,
    BooleanLiteral,
    ExpressionStatement,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    Node,
    PrefixExpression,
    Program,
    Statement,
} from './ast';
import { MonkeyObject, Integer, NULL, TRUE, FALSE } from './object';

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

    if (node instanceof InfixExpression) {
        const left = evaluate(node.left);
        const right = evaluate(node.right);
        return evaluateInfixExpression(node.operator, left, right);
    }

    if (node instanceof BlockStatement) {
        return evaluateStatements(node.statements);
    }

    if (node instanceof IfExpression) {
        const condition = evaluate(node.condition);
        if (isTruthy(condition)) {
            return evaluate(node.consequence);
        } else {
            return node.alternative ? evaluate(node.alternative) : NULL;
        }
    }

    throw new Error(`Unknown node type: ${node.type}`);
}

function isTruthy(obj: MonkeyObject): boolean {
    switch (obj) {
        case NULL:
            return false;
        case TRUE:
            return true;
        case FALSE:
            return false;
        default:
            return true;
    }
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
            // !integer is false
            return FALSE;
    }
}

function evaluateMinusPrefixOperatorExpression(right: MonkeyObject): MonkeyObject {
    if (!(right instanceof Integer)) {
        throw new Error(`Unknown operator: -${right.type}`);
    }

    return new Integer(-right.value);
}

function evaluateInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
    if (left instanceof Integer && right instanceof Integer) {
        return evaluateIntegerInfixExpression(operator, left, right);
    }

    // just compare the objects directly, only integers need use their value
    if (operator == '==') {
        return left == right ? TRUE : FALSE;
    } else if (operator == '!=') {
        return left !== right ? TRUE : FALSE;
    }

    throw new Error('Unknown');
}

function evaluateIntegerInfixExpression(operator: string, left: Integer, right: Integer): MonkeyObject {
    switch (operator) {
        case '+':
            return new Integer(left.value + right.value);
        case '-':
            return new Integer(left.value - right.value);
        case '*':
            return new Integer(left.value * right.value);
        case '/':
            return new Integer(left.value / right.value);
        case '<':
            return left.value < right.value ? TRUE : FALSE;
        case '>':
            return left.value > right.value ? TRUE : FALSE;
        case '==':
            return left.value === right.value ? TRUE : FALSE;
        case '!=':
            return left.value !== right.value ? TRUE : FALSE;
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}
