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

export class FunctionLiteral implements Expression {
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
