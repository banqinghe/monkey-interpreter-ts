import Token, { TokenType } from './token';

export interface Node {
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

// TODO: better type, remove unnecessary optional properties

export class LetStatement implements Statement {
    token: Token;
    name?: Identifier;
    value?: Expression;

    constructor(args: { token?: Token; name?: Identifier; value?: Expression } = {}) {
        this.token = args.token || new Token(Token.LET, 'let');
        this.name = args.name;
        this.value = args.value;
    }

    statementNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        if (this.name && this.value) {
            return `${this.tokenLiteral()} ${this.name.toString()} = ${this.value.toString()}`;
        } else {
            return '[Invalid LetStatement toString]';
        }
    }
}

export class Identifier implements Expression {
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
    token: Token;
    value: number;

    constructor({ token, value }: { token: Token; value: number }) {
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

export class PrefixExpression implements Expression {
    token: Token;
    operator: string;
    right?: Expression;

    constructor({ token, operator, right }: { token: Token; operator: string; right?: Expression }) {
        this.token = token;
        this.operator = operator;
        this.right = right;
    }

    expressionNode() {}

    tokenLiteral() {
        return this.token.literal;
    }

    toString() {
        if (this.right) {
            return `(${this.operator}${this.right.toString()})`;
        } else {
            return '[Invalid PrefixExpression toString]';
        }
    }
}

export class InfixExpression implements Expression {
    token: Token;
    left: Expression;
    operator: string;
    right?: Expression;

    constructor({ token, left, operator, right }: { token: Token; left: Expression; operator: string; right?: Expression }) {
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
        if (this.right) {
            return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
        } else {
            return '[Invalid InfixExpression toString]';
        }
    }
}

export class ReturnStatement implements Statement {
    token: Token;
    returnValue?: Expression;

    constructor(args: { token?: Token; returnValue?: Expression } = {}) {
        this.token = args.token || new Token(Token.RETURN, 'return');
        this.returnValue = args.returnValue;
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
    token: Token;
    expression?: Expression;

    constructor(args: { token: Token; expression?: Expression }) {
        this.token = args.token;
        this.expression = args.expression;
    }

    statementNode() {}

    tokenLiteral() {
        return this.token?.literal || '[Invalid ExpressionStatement tokenLiteral]';
    }

    toString() {
        return this.expression?.toString() || '[Invalid ExpressionStatement toString]';
    }
}
