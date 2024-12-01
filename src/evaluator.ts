import {
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    Node,
    PrefixExpression,
    Program,
    ReturnStatement,
    StringLiteral,
} from './ast';
import {
    MonkeyObject,
    MonkeyInteger,
    ReturnValue,
    MonkeyError,
    MonkeyFunction,
    MonkeyString,
    TRUE,
    FALSE,
    NULL,
    MonkeyBuiltinFunction,
} from './object';
import { builtins } from './builtins';
import { Environment, EnclosedEnvironment } from './environment';

export function evaluate(node: Node, env: Environment): MonkeyObject {
    if (node instanceof Program) {
        return evaluateProgram(node, env);
    }

    if (node instanceof LetStatement) {
        const value = evaluate(node.value, env);
        if (isMonkeyError(value)) {
            return value;
        }
        return env.set(node.name.value, value);
    }

    if (node instanceof ReturnStatement) {
        const value = evaluate(node.returnValue, env);
        if (isMonkeyError(value)) {
            return value;
        }
        return new ReturnValue(value);
    }

    if (node instanceof ExpressionStatement) {
        return evaluate(node.expression, env);
    }

    if (node instanceof IntegerLiteral) {
        return new MonkeyInteger(node.value);
    }

    if (node instanceof BooleanLiteral) {
        return node.value ? TRUE : FALSE;
    }

    if (node instanceof StringLiteral) {
        return new MonkeyString(node.value);
    }

    if (node instanceof Identifier) {
        return evaluateIdentifier(node, env);
    }

    if (node instanceof FunctionLiteral) {
        const params = node.parameters;
        const body = node.body;
        return new MonkeyFunction(params, body, env);
    }

    if (node instanceof CallExpression) {
        const func = evaluate(node.func, env);
        if (isMonkeyError(func)) {
            return func;
        }
        const args = evaluateExpressions(node.args, env);
        if (args.length === 1 && isMonkeyError(args[0])) {
            return args[0];
        }
        return applyFunction(func, args);
    }

    if (node instanceof PrefixExpression) {
        const right = evaluate(node.right, env);
        if (isMonkeyError(right)) {
            return right;
        }
        return evaluatePrefixExpression(node.operator, right);
    }

    if (node instanceof InfixExpression) {
        const left = evaluate(node.left, env);
        if (isMonkeyError(left)) {
            return left;
        }
        const right = evaluate(node.right, env);
        if (isMonkeyError(right)) {
            return right;
        }
        return evaluateInfixExpression(node.operator, left, right);
    }

    if (node instanceof BlockStatement) {
        return evaluateBlockStatement(node, env);
    }

    if (node instanceof IfExpression) {
        const condition = evaluate(node.condition, env);
        if (isMonkeyError(condition)) {
            return condition;
        }
        if (isTruthy(condition)) {
            return evaluate(node.consequence, env);
        } else {
            return node.alternative ? evaluate(node.alternative, env) : NULL;
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

function isMonkeyError(obj: MonkeyObject): boolean {
    return obj instanceof MonkeyError;
}

function evaluateProgram(program: Program, env: Environment): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of program.statements) {
        result = evaluate(statement, env);

        if (result instanceof ReturnValue) {
            return result.value;
        }

        if (result instanceof MonkeyError) {
            return result;
        }
    }

    return result;
}

function evaluateBlockStatement(block: BlockStatement, env: Environment): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of block.statements) {
        result = evaluate(statement, env);

        if (result instanceof ReturnValue || result instanceof MonkeyError) {
            // return `result` instead of `result.value` to allow it to appear at the top of blocks
            return result;
        }
    }

    return result;
}

function evaluateExpressions(expressions: Expression[], env: Environment): MonkeyObject[] {
    const result: MonkeyObject[] = [];

    for (const expression of expressions) {
        const evaluated = evaluate(expression, env);
        if (isMonkeyError(evaluated)) {
            return [evaluated];
        }
        result.push(evaluated);
    }

    return result;
}

function applyFunction(fn: MonkeyObject, args: MonkeyObject[]) {
    if (fn instanceof MonkeyFunction) {
        const extendEnv = extendFunctionEnv(fn, args);
        const evaluated = evaluate(fn.body, extendEnv);
        return unwrapReturnValue(evaluated);
    } else if (fn instanceof MonkeyBuiltinFunction) {
        return fn.fn(...args);
    } else {
        return new MonkeyError(`Not a function: ${fn.type}`);
    }
}

function extendFunctionEnv(fn: MonkeyFunction, args: MonkeyObject[]) {
    const env = new EnclosedEnvironment(fn.env);
    for (const [paramIdx, param] of fn.parameters.entries()) {
        env.set(param.value, args[paramIdx]);
    }
    return env;
}

function unwrapReturnValue(obj: MonkeyObject): MonkeyObject {
    if (obj instanceof ReturnValue) {
        return obj.value;
    }
    return obj;
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
    if (!(right instanceof MonkeyInteger)) {
        return new MonkeyError(`unknown operator: -${right.type()}`);
    }

    return new MonkeyInteger(-right.value);
}

function evaluateInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
    if (left.type() !== right.type()) {
        return new MonkeyError(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    }

    if (left instanceof MonkeyInteger && right instanceof MonkeyInteger) {
        return evaluateIntegerInfixExpression(operator, left, right);
    } else if (left instanceof MonkeyString && right instanceof MonkeyString) {
        return evaluateStringInfixExpression(operator, left, right);
    }

    // just compare the objects directly, only integers need use their value
    if (operator == '==') {
        return left == right ? TRUE : FALSE;
    } else if (operator == '!=') {
        return left !== right ? TRUE : FALSE;
    }

    return new MonkeyError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
}

function evaluateIntegerInfixExpression(operator: string, left: MonkeyInteger, right: MonkeyInteger): MonkeyObject {
    switch (operator) {
        case '+':
            return new MonkeyInteger(left.value + right.value);
        case '-':
            return new MonkeyInteger(left.value - right.value);
        case '*':
            return new MonkeyInteger(left.value * right.value);
        case '/':
            return new MonkeyInteger(left.value / right.value);
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
            return new MonkeyError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
    }
}

function evaluateStringInfixExpression(operator: string, left: MonkeyString, right: MonkeyString): MonkeyObject {
    switch (operator) {
        case '+':
            return new MonkeyString(left.value + right.value);
        // case '<':
        //     return left.value < right.value ? TRUE : FALSE;
        // case '>':
        //     return left.value > right.value ? TRUE : FALSE;
        case '==':
            return left.value === right.value ? TRUE : FALSE;
        case '!=':
            return left.value !== right.value ? TRUE : FALSE;
        default:
            // this branch will not be executed yet
            return new MonkeyError(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
    }
}

function evaluateIdentifier(node: Identifier, env: Environment): MonkeyObject {
    const value = env.get(node.value);
    if (value) {
        return value;
    }

    if (builtins.has(node.value)) {
        return builtins.get(node.value) as MonkeyObject;
    }

    return new MonkeyError(`identifier not found: ${node.value}`);
}
