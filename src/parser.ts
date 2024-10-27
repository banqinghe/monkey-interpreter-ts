import Lexer from './lexer';
import Token, { TokenType } from './token';
import {
    Expression,
    ExpressionStatement,
    Identifier,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from './ast';

type prefixParseFn = () => Expression;
type infixParseFn = (left: Expression) => Expression;

// 优先级
const LOWEST = 0;
const EQUALS = 1; // ==
const LESSGREATER = 2; // > or <
const SUM = 3; // +
const PRODUCT = 4; // *
const PREFIX = 5; // -x or !x
const CALL = 6; // myFunction(x)

export default class Parser {
    curToken!: Token;
    peekToken!: Token;

    lexer: Lexer;
    errors: string[];

    prefixParseFns: Map<TokenType, prefixParseFn>;
    infixParseFns: Map<TokenType, infixParseFn>;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.errors = [];

        this.prefixParseFns = new Map([
            [Token.IDENT, this.parseIdentifier.bind(this)],
            [Token.INT, this.parseIntegerLiteral.bind(this)],
            [Token.BANG, this.parsePrefixExpression.bind(this)],
            [Token.MINUS, this.parsePrefixExpression.bind(this)],
        ]);
        this.infixParseFns = new Map();

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

    noPrefixParseFnError(t: TokenType) {
        this.errors.push(`no prefix parse function for ${t} found`);
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
            case Token.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseLetStatement(): Statement | null {
        const statement = new LetStatement();

        if (!this.expectPeek(Token.IDENT)) {
            return null;
        }
        statement.name = new Identifier({
            token: this.curToken,
            value: this.curToken.literal,
        });

        if (!this.expectPeek(Token.ASSIGN)) {
            return null;
        }
        // TODO: parse Expression
        while (!this.curTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    parseReturnStatement(): Statement | null {
        const statement = new ReturnStatement();

        this.nextToken();

        // TODO: parse Expression
        while (!this.curTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    parseExpressionStatement(): Statement | null {
        const statement = new ExpressionStatement({
            token: this.curToken,
            expression: this.parseExpression(LOWEST),
        });

        if (this.peekTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    parseExpression(precedence: number) {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) {
            this.noPrefixParseFnError(this.curToken.type);
            return;
        }
        return prefix();
    }

    parseIdentifier(): Expression {
        return new Identifier({
            token: this.curToken,
            value: this.curToken.literal,
        });
    }

    parseIntegerLiteral(): Expression {
        const literal = new IntegerLiteral({
            token: this.curToken,
            value: parseInt(this.curToken.literal),
        });
        return literal;
    }

    parsePrefixExpression(): Expression {
        const prefixToken = this.curToken;
        this.nextToken();
        return new PrefixExpression({
            token: prefixToken,
            operator: prefixToken.literal,
            right: this.parseExpression(PREFIX),
        });
    }
}
