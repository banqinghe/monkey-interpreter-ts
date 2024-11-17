import { BlockStatement, Identifier } from './ast';
import { Environment } from './environment';

type MonkeyObjectType =
    | 'INTEGER'
    | 'BOOLEAN'
    | 'NULL'
    | 'RETURN'
    | 'ERROR'
    | 'FUNCTION';

const INTEGER_OBJ = 'INTEGER';
const BOOLEAN_OBJ = 'BOOLEAN';
const NULL_OBJ = 'NULL';
const RETURN_VALUE_OBJ = 'RETURN';
const ERROR_OBJ = 'ERROR';
const FUNCTION_OBJ = 'FUNCTION';

export interface MonkeyObject {
    type(): MonkeyObjectType;
    inspect(): string;
}

export class Integer implements MonkeyObject {
    constructor(readonly value: number) {}

    inspect(): string {
        return this.value.toString();
    }

    type(): MonkeyObjectType {
        return INTEGER_OBJ;
    }
}

export class Boolean implements MonkeyObject {
    constructor(readonly value: boolean) {}

    inspect(): string {
        return this.value.toString();
    }

    type(): MonkeyObjectType {
        return BOOLEAN_OBJ;
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

export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);
export const NULL = new Null();
