import { BooleanLiteral, ExpressionStatement, IntegerLiteral, Node, Program, Statement } from './ast';
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

    throw new Error(`Unknown node type: ${node.type}`);
}

function evaluateStatements(statements: Statement[]): MonkeyObject {
    let result: MonkeyObject = NULL;

    for (const statement of statements) {
        result = evaluate(statement);
    }

    return result;
}
