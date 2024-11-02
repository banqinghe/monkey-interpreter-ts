import { Lexer, Parser } from 'monkey-parser';

export function parser(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    return [program, parser.errors] as const;
}
