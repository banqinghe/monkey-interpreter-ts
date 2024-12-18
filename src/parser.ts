import Lexer from './lexer';
import Token, { TokenType } from './token';
import {
    ArrayLiteral,
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    HashLiteral,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
} from './ast';

type prefixParseFn = () => Expression;
type infixParseFn = (left: Expression) => Expression;

// precedence value
const LOWEST = 0;
const EQUALS = 1; // ==
const LESSGREATER = 2; // > or <
const SUM = 3; // +
const PRODUCT = 4; // *
const PREFIX = 5; // -x or !x
const CALL = 6; // myFunction(x)
const INDEX = 7; // arr[1]

const precedences = new Map<TokenType, number>([
    [Token.EQ, EQUALS],
    [Token.NOT_EQ, EQUALS],
    [Token.LT, LESSGREATER],
    [Token.GT, LESSGREATER],
    [Token.PLUS, SUM],
    [Token.MINUS, SUM],
    [Token.SLASH, PRODUCT],
    [Token.ASTERISK, PRODUCT],
    [Token.LPAREN, CALL],
    [Token.LBRACKET, INDEX],
]);

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
            [Token.TRUE, this.parseBooleanLiteral.bind(this)],
            [Token.FALSE, this.parseBooleanLiteral.bind(this)],
            [Token.STRING, this.parseStringLiteral.bind(this)],
            [Token.BANG, this.parsePrefixExpression.bind(this)],
            [Token.MINUS, this.parsePrefixExpression.bind(this)],
            [Token.LPAREN, this.parseGroupedExpression.bind(this)],
            [Token.IF, this.parseIfExpression.bind(this)],
            [Token.FUNCTION, this.parseFunctionLiteral.bind(this)],
            [Token.LBRACKET, this.parseArrayLiteral.bind(this)],
            [Token.LBRACE, this.parseHashLiteral.bind(this)],
        ]);
        this.infixParseFns = new Map([
            [Token.PLUS, this.parseInfixExpression.bind(this)],
            [Token.MINUS, this.parseInfixExpression.bind(this)],
            [Token.SLASH, this.parseInfixExpression.bind(this)],
            [Token.ASTERISK, this.parseInfixExpression.bind(this)],
            [Token.EQ, this.parseInfixExpression.bind(this)],
            [Token.NOT_EQ, this.parseInfixExpression.bind(this)],
            [Token.LT, this.parseInfixExpression.bind(this)],
            [Token.GT, this.parseInfixExpression.bind(this)],
            [Token.LPAREN, this.parseCallExpression.bind(this)],
            [Token.LBRACKET, this.parseIndexExpression.bind(this)],
        ]);

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

    peekPrecedence() {
        return precedences.get(this.peekToken.type) || LOWEST;
    }

    curPrecedence() {
        return precedences.get(this.curToken.type) || LOWEST;
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

    parseStatement(): Statement {
        switch (this.curToken.type) {
            case Token.LET:
                return this.parseLetStatement();
            case Token.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseLetStatement(): Statement {
        const letToken = this.curToken;

        if (!this.expectPeek(Token.IDENT)) {
            throw new Error(`parseLetStatement: got ${this.peekToken.type} instead of IDENT`);
        }

        const name = new Identifier({
            token: this.curToken,
            value: this.curToken.literal,
        });

        if (!this.expectPeek(Token.ASSIGN)) {
            throw new Error(`parseLetStatement: got ${this.peekToken.type} instead of ASSIGN`);
        }

        this.nextToken();

        const value = this.parseExpression(LOWEST);

        if (this.peekTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return new LetStatement({
            token: letToken,
            name,
            value,
        });
    }

    parseReturnStatement(): Statement {
        const returnToken = this.curToken;
        this.nextToken();

        const returnValue = this.parseExpression(LOWEST);

        if (this.peekTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return new ReturnStatement({
            token: returnToken,
            returnValue,
        });
    }

    parseExpressionStatement(): Statement {
        const statement = new ExpressionStatement({
            token: this.curToken,
            expression: this.parseExpression(LOWEST),
        });

        if (this.peekTokenIs(Token.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    parseBlockStatement(): BlockStatement {
        const blockToken = this.curToken;
        this.nextToken();

        const blockStatements = [];

        while (!this.curTokenIs(Token.RBRACE) && !this.curTokenIs(Token.EOF)) {
            blockStatements.push(this.parseStatement());
            this.nextToken();
        }

        return new BlockStatement({
            token: blockToken,
            statements: blockStatements,
        });
    }

    parseExpression(precedence: number): Expression {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) {
            this.noPrefixParseFnError(this.curToken.type);
            throw new Error(`parseExpression: no prefixFn for token ${this.curToken.type}`);
        }
        let leftExp = prefix();

        while (!this.peekTokenIs(Token.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns.get(this.peekToken.type);
            if (!infix) {
                return leftExp;
            }
            this.nextToken();

            leftExp = infix(leftExp);
        }

        return leftExp;
    }

    parseIdentifier(): Identifier {
        return new Identifier({
            token: this.curToken,
            value: this.curToken.literal,
        });
    }

    parseIntegerLiteral(): Expression {
        return new IntegerLiteral({
            token: this.curToken,
            value: this.curToken.literal,
        });
    }

    parseBooleanLiteral(): Expression {
        return new BooleanLiteral({
            token: this.curToken,
            value: this.curTokenIs(Token.TRUE),
        });
    }

    parseStringLiteral(): Expression {
        return new StringLiteral({
            token: this.curToken,
            value: this.curToken.literal,
        });
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

    parseInfixExpression(left: Expression): Expression {
        const token = this.curToken;
        const precedence = this.curPrecedence();
        this.nextToken();
        return new InfixExpression({
            token,
            left,
            operator: token.literal,
            right: this.parseExpression(precedence),
        });
    }

    parseGroupedExpression(): Expression {
        this.nextToken();

        const expression = this.parseExpression(LOWEST);

        if (!this.expectPeek(Token.RPAREN)) {
            this.peekError(Token.RPAREN);
        }

        return expression;
    }

    parseIfExpression(): Expression {
        const ifToken = this.curToken;

        if (!this.expectPeek(Token.LPAREN)) {
            this.peekError(Token.LPAREN);
        }

        // if (x < y)
        //    ^
        this.nextToken();

        const condition = this.parseExpression(LOWEST);

        if (!this.expectPeek(Token.RPAREN)) {
            throw new Error(`parseIfExpression: got ${this.peekToken.type} instead of RPAREN`);
        }
        if (!this.expectPeek(Token.LBRACE)) {
            throw new Error(`parseIfExpression - if: got ${this.peekToken.type} instead of LBRACE`);
        }

        const consequence = this.parseBlockStatement();
        let alternative = undefined;

        if (this.peekTokenIs(Token.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(Token.LBRACE)) {
                throw new Error(`parseIfExpression - else: got ${this.peekToken.type} instead of LBRACE`);
            }
            alternative = this.parseBlockStatement();
        }

        return new IfExpression({
            token: ifToken,
            condition,
            consequence,
            alternative,
        });
    }

    parseFunctionLiteral(): Expression {
        // fn(x, y) { x + y; }
        //  ^
        const fnToken = this.curToken;

        // fn(x, y) { x + y; }
        //   ^
        if (!this.expectPeek(Token.LPAREN)) {
            throw new Error(`parseFunctionLiteral: got ${this.peekToken.type} instead of LPAREN`);
        }

        const parameters = this.parseFunctionParameters();

        // fn(x, y) { x + y; }
        //          ^
        if (!this.expectPeek(Token.LBRACE)) {
            throw new Error(`parseFunctionLiteral: got ${this.peekToken.type} instead of LBRACE`);
        }

        const body = this.parseBlockStatement();

        return new FunctionLiteral({
            token: fnToken,
            parameters,
            body,
        });
    }

    parseFunctionParameters(): Identifier[] {
        // empty parameter list
        if (this.peekTokenIs(Token.RPAREN)) {
            this.nextToken();
            return [];
        }

        // fn(x, y) { x + y; }
        //    ^
        this.nextToken();

        const identifiers: Identifier[] = [];
        identifiers.push(this.parseIdentifier());

        while (this.peekTokenIs(Token.COMMA)) {
            this.nextToken();
            this.nextToken();
            identifiers.push(this.parseIdentifier());
        }

        if (!this.expectPeek(Token.RPAREN)) {
            throw new Error(`parseFunctionParameters: got ${this.peekToken.type} instead of RPAREN`);
        }

        return identifiers;
    }

    parseCallExpression(func: Expression): Expression {
        return new CallExpression({
            token: this.curToken,
            func,
            args: this.parseCallArguments(),
        });
    }

    parseExpressionList(end: TokenType): Expression[] {
        const list: Expression[] = [];

        if (this.peekTokenIs(end)) {
            this.nextToken();
            return list;
        }

        this.nextToken();
        list.push(this.parseExpression(LOWEST));

        while (this.peekTokenIs(Token.COMMA)) {
            this.nextToken();
            this.nextToken();
            list.push(this.parseExpression(LOWEST));
        }

        if (!this.expectPeek(end)) {
            throw new Error(`parseExpressionList: got ${this.peekToken.type} instead of ${end}`);
        }

        return list;
    }

    parseCallArguments(): Expression[] {
        return this.parseExpressionList(Token.RPAREN);
    }

    parseArrayLiteral(): Expression {
        return new ArrayLiteral({
            token: this.curToken,
            elements: this.parseExpressionList(Token.RBRACKET),
        });
    }

    parseHashLiteral(): Expression {
        const token = this.curToken;
        const pairs: Array<{ key: Expression; value: Expression }> = [];

        while (!this.peekTokenIs(Token.RBRACE)) {
            this.nextToken();

            const key = this.parseExpression(LOWEST);

            if (!this.expectPeek(Token.COLON)) {
                throw new Error(`parseHashLiteral: got ${this.peekToken.type} instead of COLON`);
            }
            this.nextToken();

            const value = this.parseExpression(LOWEST);
            pairs.push({ key, value });

            if (!this.peekTokenIs(Token.RBRACE) && !this.expectPeek(Token.COMMA)) {
                throw new Error(`parseHashLiteral: got ${this.peekToken.type} instead of RBRACE/COMMA`);
            }
        }

        if (!this.expectPeek(Token.RBRACE)) {
            throw new Error(`parseHashLiteral: got ${this.peekToken.type} instead of RBRACE`);
        }

        return new HashLiteral({ token, pairs });
    }

    parseIndexExpression(left: Expression): Expression {
        const token = this.curToken;

        this.nextToken();

        const indexExpression = new IndexExpression({
            token,
            left,
            index: this.parseExpression(LOWEST),
        });

        if (!this.expectPeek(Token.RBRACKET)) {
            throw new Error(`parseIndexExpression: got ${this.peekToken.type} instead of RBRACKET`);
        }

        return indexExpression;
    }
}
