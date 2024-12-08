import {
    MonkeyArray,
    MonkeyBuiltinFunction,
    MonkeyError,
    MonkeyInteger,
    MonkeyObject,
    STRING_OBJ,
    ARRAY_OBJ,
    NULL,
} from './object';

/** Returns the length of the given argument */
function len(...args: MonkeyObject[]): MonkeyObject {
    if (args.length !== 1) {
        return new MonkeyError(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];
    const argType = arg.type();

    if (argType === STRING_OBJ) {
        return new MonkeyInteger(BigInt(arg.inspect().length));
    } else if (argType === ARRAY_OBJ) {
        return new MonkeyInteger(BigInt((arg as MonkeyArray).elements.length));
    } else {
        return new MonkeyError(`argument to \`len\` not supported, got=${arg.type()}`);
    }
}

/** Returns the first element of the given array */
function first(...args: MonkeyObject[]): MonkeyObject {
    if (args.length !== 1) {
        return new MonkeyError(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];
    const argType = arg.type();

    if (argType !== ARRAY_OBJ) {
        return new MonkeyError(`argument to \`first\` must be ARRAY, got ${arg.type()}`);
    }

    const array = arg as MonkeyArray;
    if (array.elements.length > 0) {
        return array.elements[0];
    }

    return NULL;
}

/** Returns the last element of the given array */
function last(...args: MonkeyObject[]): MonkeyObject {
    if (args.length !== 1) {
        return new MonkeyError(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];
    const argType = arg.type();

    if (argType !== ARRAY_OBJ) {
        return new MonkeyError(`argument to \`last\` must be ARRAY, got ${arg.type()}`);
    }

    const array = arg as MonkeyArray;
    if (array.elements.length > 0) {
        return array.elements.at(-1)!;
    }

    return NULL;
}

function rest(...args: MonkeyObject[]): MonkeyObject {
    if (args.length !== 1) {
        return new MonkeyError(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];
    const argType = arg.type();

    if (argType !== ARRAY_OBJ) {
        return new MonkeyError(`argument to \`rest\` must be ARRAY, got ${arg.type()}`);
    }

    const array = arg as MonkeyArray;
    if (array.elements.length > 0) {
        return new MonkeyArray(array.elements.slice(1));
    }

    return NULL;
}

function push(...args: MonkeyObject[]): MonkeyObject {
    if (args.length !== 2) {
        return new MonkeyError(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];
    const argType = arg.type();

    if (argType !== ARRAY_OBJ) {
        return new MonkeyError(`the first argument of \`push\` must be ARRAY, got ${arg.type()}`);
    }

    const array = arg as MonkeyArray;
    if (array.elements.length > 0) {
        return new MonkeyArray([...array.elements, args[1]]);
    }
    return new MonkeyArray([args[1]]);
}

function puts(...args: MonkeyObject[]): MonkeyObject {
    args.forEach(arg => console.log(arg.inspect()));
    return NULL;
}

export const builtins = new Map<string, MonkeyBuiltinFunction>([
    ['len', new MonkeyBuiltinFunction(len)],
    ['first', new MonkeyBuiltinFunction(first)],
    ['last', new MonkeyBuiltinFunction(last)],
    ['rest', new MonkeyBuiltinFunction(rest)],
    ['push', new MonkeyBuiltinFunction(push)],
    ['puts', new MonkeyBuiltinFunction(puts)],
]);
