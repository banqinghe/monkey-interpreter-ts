export type TokenType =
    | 'ILLEGAL'
    | 'EOF'
    | 'IDENT'
    | 'INT'
    | '='
    | '+'
    | '-'
    | '*'
    | '/'
    | '!'
    | '<'
    | '>'
    | '=='
    | '!='
    | ','
    | ';'
    | '('
    | ')'
    | '{'
    | '}'
    | 'FUNCTION'
    | 'LET'
    | 'TRUE'
    | 'FALSE'
    | 'IF'
    | 'ELSE'
    | 'RETURN';

/** 关键词映射表, 用来判断是否是关键词和关键词类型 */
const keywords: Record<string, TokenType> = {
    fn: 'FUNCTION',
    let: 'LET',
    true: 'TRUE',
    false: 'FALSE',
    if: 'IF',
    else: 'ELSE',
    return: 'RETURN',
};

export default class Token {
    static ILLEGAL: TokenType = 'ILLEGAL';
    static EOF: TokenType = 'EOF';

    // Identifiers + literals
    static IDENT: TokenType = 'IDENT';
    static INT: TokenType = 'INT';

    // operators
    static ASSIGN: TokenType = '=';
    static PLUS: TokenType = '+';
    static MINUS: TokenType = '-';
    static BANG: TokenType = '!';
    static ASTERISK: TokenType = '*';
    static SLASH: TokenType = '/';
    static LT: TokenType = '<';
    static GT: TokenType = '>';
    static EQ: TokenType = '==';
    static NOT_EQ: TokenType = '!=';

    // delimiters
    static COMMA: TokenType = ',';
    static SEMICOLON: TokenType = ';';

    static LPAREN: TokenType = '(';
    static RPAREN: TokenType = ')';
    static LBRACE: TokenType = '{';
    static RBRACE: TokenType = '}';

    // keywords
    static FUNCTION: TokenType = 'FUNCTION';
    static LET: TokenType = 'LET';
    static TRUE: TokenType = 'TRUE';
    static FALSE: TokenType = 'FALSE';
    static IF: TokenType = 'IF';
    static ELSE: TokenType = 'ELSE';
    static RETURN: TokenType = 'RETURN';

    static lookupIdent(ident: string): TokenType {
        return keywords[ident] || 'IDENT';
    };

    type: TokenType;
    literal: string;

    constructor(type: TokenType, literal: string) {
        this.type = type;
        this.literal = literal;
    }
}
