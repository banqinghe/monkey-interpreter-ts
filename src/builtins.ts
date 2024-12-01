import { MonkeyBuiltinFunction, MonkeyError, MonkeyInteger, MonkeyObject } from './object';

/** Returns the length of the given argument */
function len(...args: MonkeyObject[]): MonkeyObject {
    if (args.length !== 1) {
        return new MonkeyError(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];

    if (arg.type() === 'STRING') {
        return new MonkeyInteger(arg.inspect().length);
    } else {
        return new MonkeyError(`argument to \`len\` not supported, got=${arg.type()}`);
    }
}

export const builtins = new Map<string, MonkeyBuiltinFunction>([
    ['len', new MonkeyBuiltinFunction(len)],
]);
