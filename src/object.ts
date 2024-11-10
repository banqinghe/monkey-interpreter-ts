type MonkeyObjectType =
    | 'INTEGER'
    | 'BOOLEAN'
    | 'NULL';

const INTEGER_OBJ = 'INTEGER';
const BOOLEAN_OBJ = 'BOOLEAN';
const NULL_OBJ = 'NULL';

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
