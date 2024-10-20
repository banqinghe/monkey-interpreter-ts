import Token from './token';

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

    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    nextToken(): Token {
        let token: Token;

        switch (this.ch) {
            case '=':
                token = new Token(Token.ASSIGN, this.ch);
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
                token = new Token(Token.EOF, '');
        }

        this.readChar();
        return token;
    }
}
