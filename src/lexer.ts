import Token from './token';

function isLetter(ch: string): boolean {
    return /^[a-zA-Z_]$/.test(ch);
}

function isDigit(ch: string): boolean {
    return /^[0-9]$/.test(ch);
}

export default class Lexer {
    input: string;
    /** Current position in the input string (points to the current character) */
    position: number;
    /** Current reading position in the input string (points to the character after the current character) */
    readPosition: number;
    /** The current character being examined */
    ch: string;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.readPosition = 0;
        this.ch = '';

        this.readChar();
    }

    /** Reads the next character */
    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    /** Peeks at the next character */
    peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return '';
        } else {
            return this.input[this.readPosition];
        }
    }

    /** Reads the next identifier, which can be either a keyword or a regular identifier */
    readIdentifier(): Token {
        const position = this.position;
        while (isLetter(this.ch)) {
            this.readChar();
        }
        const identifier = this.input.slice(position, this.position);
        const tokenType = Token.lookupIdent(identifier);

        return new Token(tokenType, identifier);
    }

    /** Reads the next number */
    readNumber(): Token {
        const position = this.position;
        while (isDigit(this.ch)) {
            this.readChar();
        }
        const number = this.input.slice(position, this.position);
        return new Token(Token.INT, number);
    }

    readString(): string {
        const chars: string[] = [];

        while (true) {
            this.readChar();
            if (this.ch === '\\' && this.peekChar() === '\\') {
                this.readChar();
                chars.push('\\');
            } else if (this.ch === '\\' && this.peekChar() === '"') {
                this.readChar();
                chars.push('"');
            } else if (this.ch === '\\' && this.peekChar() === 'n') {
                this.readChar();
                chars.push('\n');
            } else if (this.ch === '\\' && this.peekChar() === 't') {
                this.readChar();
                chars.push('\t');
            } else if (this.ch === '"') {
                break;
            } else if (this.ch === '') {
                throw new Error('Lexer: unterminated string');
            } else {
                chars.push(this.ch);
            }
        }

        return chars.join('');
    }

    readComment(): string {
        let comment = '';

        this.readChar();

        while (true) {
            this.readChar();
            if (this.ch === '' || this.ch === '\n') {
                break;
            }
            comment += this.ch;
        }

        return comment;
    }

    /** Skips whitespace characters */
    skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
            this.readChar();
        }
    }

    skipWhitespaceAndComments() {
        while (true) {
            this.skipWhitespace();
            if (this.ch === '/' && this.peekChar() === '/') {
                // no processing of comments
                this.readComment();
            } else {
                break;
            }
        }
    }

    nextToken(): Token {
        let token: Token;

        this.skipWhitespaceAndComments();

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    this.readChar();
                    token = new Token(Token.EQ, '==');
                } else {
                    token = new Token(Token.ASSIGN, this.ch);
                }
                break;
            case ':':
                token = new Token(Token.COLON, this.ch);
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
            case '[':
                token = new Token(Token.LBRACKET, this.ch);
                break;
            case ']':
                token = new Token(Token.RBRACKET, this.ch);
                break;
            case '"':
                token = new Token(Token.STRING, this.readString());
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
