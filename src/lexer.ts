import Token from './token';

function isLetter(ch: string): boolean {
    return /^[a-zA-Z_]$/.test(ch);
}

function isDigit(ch: string): boolean {
    return /^[0-9]$/.test(ch);
}

export default class Lexer {
    input: string;
    /** 输入字符串当前的位置 (指向当前字符) */
    position: number;
    /** 输入字符串当前的读取位置 (指向当前字符后的一个字符) */
    readPosition: number;
    /** 当前正在查看的字符 */
    ch: string;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.readPosition = 0;
        this.ch = '';

        this.readChar();
    }

    /** 读取下一个字符 */
    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    /** 查看下一个字符 */
    peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return '';
        } else {
            return this.input[this.readPosition];
        }
    }

    /** 读取下一个 identifier, 有 keywords 和普通 identifier 两种可能 */
    readIdentifier(): Token {
        const position = this.position;
        while (isLetter(this.ch)) {
            this.readChar();
        }
        const identifier = this.input.slice(position, this.position);
        const tokenType = Token.lookupIdent(identifier);

        return new Token(tokenType, identifier);
    }

    /** 读取下一个数字 */
    readNumber(): Token {
        const position = this.position;
        while (isDigit(this.ch)) {
            this.readChar();
        }
        const number = this.input.slice(position, this.position);
        return new Token(Token.INT, number);
    }

    /** 跳过空白格 */
    skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
            this.readChar();
        }
    }

    nextToken(): Token {
        let token: Token;

        this.skipWhitespace();

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = new Token(Token.EQ, '==');
                } else {
                    token = new Token(Token.ASSIGN, this.ch);
                }
                break;
            case ';':
                token = new Token(Token.SEMICOLON, this.ch);
                break;
            case '(':
                token = new Token(Token.LPAREN, this.ch);
                break;
            case ')':
                token = new Token(Token.RPAREN, this.ch);
                break;
            case ',':
                token = new Token(Token.COMMA, this.ch);
                break;
            case '+':
                token = new Token(Token.PLUS, this.ch);
                break;
            case '-':
                token = new Token(Token.MINUS, this.ch);
                break;
            case '*':
                token = new Token(Token.ASTERISK, this.ch);
                break;
            case '/':
                token = new Token(Token.SLASH, this.ch);
                break;
            case '<':
                token = new Token(Token.LT, this.ch);
                break;
            case '>':
                token = new Token(Token.GT, this.ch);
                break;
            case '!':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = new Token(Token.NOT_EQ, '!=');
                } else {
                    token = new Token(Token.BANG, this.ch);
                }
                break;
            case '{':
                token = new Token(Token.LBRACE, this.ch);
                break;
            case '}':
                token = new Token(Token.RBRACE, this.ch);
                break;
            case '':
                token = new Token(Token.EOF, '');
                break;
            default:
                if (isLetter(this.ch)) {
                    return this.readIdentifier();
                } else if (isDigit(this.ch)) {
                    return this.readNumber();
                } else {
                    token = new Token(Token.ILLEGAL, this.ch);
                }
        }

        this.readChar();
        return token;
    }
}
