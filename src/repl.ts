import repl from 'node:repl';
import Token from './token';
import Lexer from './lexer';

function start() {
    console.log('Welcome to Monkey programming language.');

    repl.start({
        prompt: '>> ',
        eval: (line: string, _context: any, _filename: string, callback: (err: Error | null, result?: any) => void) => {
            try {
                const lexer = new Lexer(line);

                while (true) {
                    const token = lexer.nextToken();
                    console.log(JSON.stringify(token));
                    if (token.type === Token.EOF) {
                        break;
                    }
                }

                callback(null);
            } catch (error) {
                callback(error as Error);
            }
        },
    });
}

start();
