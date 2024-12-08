import { Lexer, Parser, evaluate as monkeyEvaluate, Environment } from 'monkey-parser';

export function parser(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    return [program, parser.errors] as const;
}

export function evaluate(input: string) {
    const startTime = performance.now();

    const [program, parseErrors] = parser(input);
    if (parseErrors.length > 0) {
        return {
            ast: program,
            errors: parseErrors,
            output: parseErrors.join('\n'),
            time: performance.now() - startTime,
        };
    }
    const evaluated = monkeyEvaluate(program, new Environment());

    return {
        ast: program,
        errors: [],
        output: evaluated.inspect(),
        time: performance.now() - startTime,
    };
}
