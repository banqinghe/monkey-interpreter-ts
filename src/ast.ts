import Token from './token';

export interface Node {
    tokenLiteral(): string;
}

export interface Statement extends Node {
    statementNode(): void;
}

export interface Expression extends Node {
    expressionNode(): void;
}

export class Program implements Node {
    statements: Statement[];

    constructor() {
        this.statements = [];
    }

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return '';
        }
    }
}

export class LetStatement implements Statement {
    token: Token = new Token(Token.LET, 'let');
    name!: Identifier;
    value!: Expression;

    statementNode(): void {

    }

    tokenLiteral(): string {
        return this.token.literal;
    }
}

export class Identifier implements Expression {
    token: Token;
    value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    expressionNode(): void {

    }

    tokenLiteral(): string {
        return this.token.literal;
    }
}
