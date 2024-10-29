import repl from 'node:repl';
import fs from 'node:fs';
import colors from 'picocolors';
import Lexer from './lexer';
import Parser from './parser';

const { green } = colors;

function start() {
    console.log('Welcome to Monkey programming language.');
    console.log('Type ".help" for more information.');

    const replServer = repl.start({
        prompt: '>> ',
        eval: (line: string, _context: any, _filename: string, callback: (err: Error | null, result?: any) => void) => {
            try {
                const lexer = new Lexer(line);
                const parser = new Parser(lexer);
                const program = parser.parseProgram();

                if (parser.errors.length > 0) {
                    parser.errors.forEach(err => console.error(`Error: ${err}`));
                    throw new Error('Parsing failed');
                }

                console.log(green(program.toString()));

                callback(null);
            } catch (error) {
                callback(error as Error);
            }
        },
    });

    replServer.defineCommand('load', {
        help: 'Load Monkey code from a file into the REPL session',
        action(filePath: string) {
            filePath = filePath.trim();
            if (!filePath) {
                console.error('Usage: .load <filePath>');
                this.displayPrompt();
                return;
            }

            try {
                const input = fs.readFileSync(filePath, 'utf8');
                const lexer = new Lexer(input);
                const parser = new Parser(lexer);
                const program = parser.parseProgram();

                if (parser.errors.length > 0) {
                    parser.errors.forEach(err => console.error(`Error: ${err}`));
                    throw new Error('Parsing failed');
                }

                console.log(green(program.toString()));
            } catch (error) {
                console.error(`Error loading file: ${error}`);
            }

            this.displayPrompt();
        },
    });
}

start();
