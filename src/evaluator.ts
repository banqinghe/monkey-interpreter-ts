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
    ReturnStatement,
    Statement,
} from './ast';
import { MonkeyObject, Integer, NULL, TRUE, FALSE, ReturnValue, MonkeyError } from './object';

export function evaluate(node: Node): MonkeyObject {
    if (node instanceof Program) {
        return evaluateProgram(node);
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
        if (isMonkeyError(right)) {
            return right;
        }
        return evaluatePrefixExpression(node.operator, right);
    }

    if (node instanceof InfixExpression) {
        const left = evaluate(node.left);
        if (isMonkeyError(left)) {
            return left;
        }
        const right = evaluate(node.right);
        if (isMonkeyError(right)) {
            return right;
        }
        return evaluateInfixExpression(node.operator, left, right);
    }

    if (node instanceof BlockStatement) {
        return evaluateBlockStatement(node);
    }

    if (node instanceof IfExpression) {
        const condition = evaluate(node.condition);
        if (isMonkeyError(condition)) {
            return condition;
        }
        if (isTruthy(condition)) {
            return evaluate(node.consequence);
        } else {
            return node.alternative ? evaluate(node.alternative) : NULL;
        }
    }

    if (node instanceof ReturnStatement) {
        const value = evaluate(node.returnValue);
        if (isMonkeyError(value)) {
            return value;
        }
        return new ReturnValue(value);
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

function isMonkeyError(obj: MonkeyObject): boolean {
    return obj instanceof MonkeyError;
}

function evaluateProgram(program: Program): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of program.statements) {
        result = evaluate(statement);

        if (result instanceof ReturnValue) {
            return result.value;
        }

        if (result instanceof MonkeyError) {
            return result;
        }
    }

    return result;
}

function evaluateBlockStatement(block: BlockStatement): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of block.statements) {
        result = evaluate(statement);

        if (result instanceof ReturnValue || result instanceof MonkeyError) {
            // return `result` instead of `result.value` to allow it to appear at the top of blocks
            return result;
        }
    }

    return result;
}

function evaluateStatements(statements: Statement[]): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of statements) {
        result = evaluate(statement);

        // If the statement is a return statement, return the value immediately.
        if (result instanceof ReturnValue) {
            return result.value;
        }
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
        return new MonkeyError(`unknown operator: -${right.type()}`);
    }

    return new Integer(-right.value);
}

function evaluateInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
    if (left.type() !== right.type()) {
        return new MonkeyError(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    }

    if (left instanceof Integer && right instanceof Integer) {
        return evaluateIntegerInfixExpression(operator, left, right);
    }

    // just compare the objects directly, only integers need use their value
    if (operator == '==') {
        return left == right ? TRUE : FALSE;
    } else if (operator == '!=') {
        return left !== right ? TRUE : FALSE;
    }

    return new MonkeyError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
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
            // this branch will not be executed yet
            return new MonkeyError(`unknown operator ${left.type()} ${operator} ${right.type()}`);
    }
}
