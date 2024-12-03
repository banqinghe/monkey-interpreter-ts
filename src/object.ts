import { BlockStatement, Identifier } from './ast';
import { Environment } from './environment';

type MonkeyObjectType =
    | 'INTEGER'
    | 'BOOLEAN'
    | 'NULL'
    | 'RETURN'
    | 'ERROR'
    | 'FUNCTION'
    | 'BUILTIN'
    | 'STRING'
    | 'ARRAY';

export const INTEGER_OBJ = 'INTEGER';
export const BOOLEAN_OBJ = 'BOOLEAN';
export const NULL_OBJ = 'NULL';
export const RETURN_VALUE_OBJ = 'RETURN';
export const ERROR_OBJ = 'ERROR';
export const FUNCTION_OBJ = 'FUNCTION';
export const BUILTIN_OBJ = 'BUILTIN';
export const STRING_OBJ = 'STRING';
export const ARRAY_OBJ = 'ARRAY';

export interface MonkeyObject {
    type(): MonkeyObjectType;
    inspect(): string;
}

export class MonkeyInteger implements MonkeyObject {
    constructor(readonly value: number) {}

    inspect(): string {
        return this.value.toString();
    }

    type(): MonkeyObjectType {
        return INTEGER_OBJ;
    }
}

export class MonkeyBoolean implements MonkeyObject {
    constructor(readonly value: boolean) {}

    inspect(): string {
        return this.value.toString();
    }

    type(): MonkeyObjectType {
        return BOOLEAN_OBJ;
    }
}

export class MonkeyString implements MonkeyObject {
    constructor(readonly value: string) {}

    inspect(): string {
        return this.value;
    }

    type(): MonkeyObjectType {
        return STRING_OBJ;
    }
}

export class MonkeyArray implements MonkeyObject {
    constructor(readonly elements: MonkeyObject[]) {}

    inspect(): string {
        return `[${this.elements.map(el => el.inspect()).join(', ')}]`;
    }

    type(): MonkeyObjectType {
        return ARRAY_OBJ;
    }
}

export class Null implements MonkeyObject {
    inspect(): string {
        return 'null';
    }

    type(): MonkeyObjectType {
        return NULL_OBJ;
    }
}

export class MonkeyFunction implements MonkeyObject {
    constructor(
        readonly parameters: Identifier[],
        readonly body: BlockStatement,
        // every function has its own environment
        readonly env: Environment,
    ) {}

    inspect(): string {
        const params = this.parameters.map(p => p.toString()).join(', ');
        return `fn(${params}) ${this.body.toString()}`;
    }

    type(): MonkeyObjectType {
        return FUNCTION_OBJ;
    }
}

export class MonkeyBuiltinFunction implements MonkeyObject {
    constructor(readonly fn: (...args: MonkeyObject[]) => MonkeyObject) {}

    inspect(): string {
        return 'builtin function';
    }

    type(): MonkeyObjectType {
        return BUILTIN_OBJ;
    }
}

export class ReturnValue implements MonkeyObject {
    constructor(readonly value: MonkeyObject) {}

    inspect(): string {
        return this.value.inspect();
    }

    type(): MonkeyObjectType {
        return RETURN_VALUE_OBJ;
    }
}

export class MonkeyError implements MonkeyObject {
    constructor(readonly message: string) {}

    inspect(): string {
        return `ERROR: ${this.message}`;
    }

    type(): MonkeyObjectType {
        return ERROR_OBJ;
    }
}

export const TRUE = new MonkeyBoolean(true);
export const FALSE = new MonkeyBoolean(false);
export const NULL = new Null();
