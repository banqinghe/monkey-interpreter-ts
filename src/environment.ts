import { MonkeyObject } from './object';

export class Environment {
    private store = new Map<string, MonkeyObject>();
    protected outer?: Environment;

    get(name: string): MonkeyObject | undefined {
        const obj = this.store.get(name);
        if (!obj && this.outer) {
            return this.outer.get(name);
        }
        return obj;
    }

    set(name: string, value: MonkeyObject): MonkeyObject {
        this.store.set(name, value);
        return value;
    }
}

export class EnclosedEnvironment extends Environment {
    constructor(readonly outer: Environment) {
        super();
        this.outer = outer;
    }
}
