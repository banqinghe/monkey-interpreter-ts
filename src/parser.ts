import Lexer from './lexer';
import Token, { TokenType } from './token';
import { Identifier, LetStatement, Program, Statement } from './ast';

export default class Parser {
    curToken!: Token;
    peekToken!: Token;
    lexer: Lexer;
    errors: string[];

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.errors = [];

        this.nextToken();
        this.nextToken();

        return this;
    }

    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    curTokenIs(t: TokenType) {
        return this.curToken.type === t;
    }

    peekTokenIs(t: TokenType) {
        return this.peekToken.type === t;
    }

    expectPeek(t: TokenType) {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }

    peekError(t: TokenType) {
        this.errors.push(`expected next token to be ${t}, got ${this.peekToken.type} instead`);
    }

    parseProgram(): Program {
        const program = new Program();

        while (!this.curTokenIs(Token.EOF)) {
            const statement = this.parseStatement();
            if (statement) {
                program.statements.push(statement);
            }
            this.nextToken();
        }

        return program;
    }

    parseStatement(): Statement | null {
        switch (this.curToken.type) {
            case Token.LET:
                return this.parseLetStatement();
            default:
                return null;
        }
    }

    parseLetStatement(): Statement | null {
        const statement = new LetStatement();

        if (!this.expectPeek(Token.IDENT)) {
            return null;
        }
        statement.name = new Identifier(this.curToken, this.curToken.literal);

        if (!this.expectPeek(Token.ASSIGN)) {
            return null;
        }
        // TODO: parse Expression
        while (!this.curTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }
}
