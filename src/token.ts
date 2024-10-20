export type TokenType = string;

export default class Token {
    static ILLEGAL: 'ILLEGAL';
    static EOF: 'EOF';

    // Identifiers + literals
    static IDENT: 'IDENT';
    static INT: 'INT';

    // operators
    static ASSIGN: '=';
    static PLUS: '+';

    // delimiters
    static COMMA: ',';
    static SEMICOLON: ';';

    static LPAREN: '(';
    static RPAREN: ')';
    static LBRACE: '{';
    static RBRACE: '}';

    // keywords
    static FUNCTION: 'FUNCTION';
    static LET: 'LET';

    type: TokenType;
    literal: string;

    constructor(type: TokenType, literal: string) {
        this.type = type;
        this.literal = literal;
    }
}
