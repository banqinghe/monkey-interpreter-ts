import Token, { TokenType } from './token';

export interface Node {
    type: string;
    tokenLiteral(): string;
    toString(): string;
}

export interface Statement extends Node {
    statementNode(): void;
}

export interface Expression extends Node {
    expressionNode(): void;
}

export class Program implements Node {
    type = 'Program';
    statements: Statement[];

    constructor(statements: Statement[] = []) {
        this.statements = statements;
    }

    tokenLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return '';
        }
    }

    toString() {
        return this.statements.map(s => s.toString()).join('\n');
    }
}

export class LetStatement implements Statement {
    type = 'LetStatement';
    token: Token;
    name: Identifier;
    value: Expression;

    constructor(args: { token: Token; name: Identifier; value: Expression }) {
        this.token = args.token || new Token(Token.LET, 'let');
        this.name = args.name;
        this.value = args.value;
    }

    statementNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return `${this.tokenLiteral()} ${this.name.toString()} = ${this.value.toString()}`;
    }
}

export class Identifier implements Expression {
    type = 'Identifier';
    token: Token;
    value: string;

    constructor({ token, value }: { token: Token; value: string }) {
        this.token = token;
        this.value = value;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return this.value;
    }
}

export class IntegerLiteral implements Expression {
    type = 'IntegerLiteral';
    token: Token;
    value: string;

    constructor({ token, value }: { token: Token; value: string }) {
        this.token = token;
        this.value = value;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return this.token.literal;
    }
}

export class BooleanLiteral implements Expression {
    type = 'BooleanLiteral';
    token: Token;
    value: boolean;

    constructor({ token, value }: { token: Token; value: boolean }) {
        this.token = token;
        this.value = value;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return this.token.literal;
    }
}

export class StringLiteral implements Expression {
    type = 'StringLiteral';
    token: Token;
    value: string;

    constructor({ token, value }: { token: Token; value: string }) {
        this.token = token;
        this.value = value;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return this.token.literal;
    }
}

export class FunctionLiteral implements Expression {
    type = 'FunctionLiteral';
    token: Token;
    parameters: Identifier[];
    body: BlockStatement;

    constructor({ token, parameters, body }: { token: Token; parameters: Identifier[]; body: BlockStatement }) {
        this.token = token;
        this.parameters = parameters;
        this.body = body;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        const params = this.parameters.map(p => p.toString()).join(', ');
        return `${this.tokenLiteral()}(${params}) ${this.body.toString()}`;
    }
}

export class ArrayLiteral implements Expression {
    type = 'ArrayLiteral';
    token: Token;
    elements: Expression[];

    constructor({ token, elements }: { token: Token; elements: Expression[] }) {
        this.token = token;
        this.elements = elements;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        const elements = this.elements.map(e => e.toString()).join(', ');
        return `[${elements}]`;
    }
}

export class HashLiteral implements Expression {
    type = 'HashLiteral';
    token: Token;
    pairs: Array<{ key: Expression; value: Expression }>;

    constructor({ token, pairs }: { token: Token; pairs: Array<{ key: Expression; value: Expression }> }) {
        this.token = token;
        this.pairs = pairs;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return `{ ${this.pairs.map(({ key, value }) => `${key.toString()}: ${value.toString()}`).join(', ')} }`;
    }
}

export class IndexExpression implements Expression {
    type = 'IndexExpression';
    token: Token;
    left: Expression;
    index: Expression;

    constructor({ token, left, index }: { token: Token; left: Expression; index: Expression }) {
        this.token = token;
        this.left = left;
        this.index = index;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return `(${this.left.toString()}[${this.index.toString()}])`;
    }
}

export class PrefixExpression implements Expression {
    type = 'PrefixExpression';
    token: Token;
    operator: string;
    right: Expression;

    constructor({ token, operator, right }: { token: Token; operator: string; right: Expression }) {
        this.token = token;
        this.operator = operator;
        this.right = right;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return `(${this.operator}${this.right.toString()})`;
    }
}

export class InfixExpression implements Expression {
    type = 'InfixExpression';
    token: Token;
    left: Expression;
    operator: string;
    right: Expression;

    constructor({ token, left, operator, right }: { token: Token; left: Expression; operator: string; right: Expression }) {
        this.token = token;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    expressionNode() {};

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }
}

export class IfExpression implements Expression {
    type = 'IfExpression';
    token: Token;
    condition: Expression;
    consequence: BlockStatement;
    alternative?: BlockStatement;

    constructor({ token, condition, consequence, alternative }: {
        token: Token;
        condition: Expression;
        consequence: BlockStatement;
        alternative?: BlockStatement;
    }) {
        this.token = token;
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        let result = `${this.tokenLiteral()} (${this.condition.toString()}) ${this.consequence.toString()}`;
        if (this.alternative) {
            result += `else ${this.alternative.toString()}`;
        }
        return result;
    }
}

export class CallExpression implements Expression {
    type = 'CallExpression';
    token: Token;
    func: Expression;
    args: Expression[];

    constructor({ token, func, args }: { token: Token; func: Expression; args: Expression[] }) {
        this.token = token;
        this.func = func;
        this.args = args;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        const args = this.args.map(arg => arg.toString()).join(', ');
        return `${this.func.toString()}(${args})`;
    }
}

export class ReturnStatement implements Statement {
    type = 'ReturnStatement';
    token: Token;
    returnValue: Expression;

    constructor({ token, returnValue }: { token: Token; returnValue: Expression }) {
        this.token = token;
        this.returnValue = returnValue;
    }

    statementNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        if (this.returnValue) {
            return `${this.tokenLiteral()} ${this.returnValue.toString()}`;
        } else {
            return '[Invalid ReturnStatement toString]';
        }
    }
}

export class ExpressionStatement implements Statement {
    type = 'ExpressionStatement';
    token: Token;
    expression: Expression;

    constructor(args: { token: Token; expression: Expression }) {
        this.token = args.token;
        this.expression = args.expression;
    }

    statementNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return this.expression.toString();
    }
}

export class BlockStatement implements Statement {
    type = 'BlockStatement';
    token: Token;
    statements: Statement[];

    constructor({ token, statements }: { token: Token; statements: Statement[] }) {
        this.token = token;
        this.statements = statements;
    }

    statementNode() {};

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        return `{${this.statements.map(statement => statement.toString()).join('\n')}}`;
    }
}
