import { MonkeyObject } from './object';

export default class Environment {
    private store = new Map<string, MonkeyObject>();

    get(name: string): MonkeyObject | undefined {
        return this.store.get(name);
    }

    set(name: string, value: MonkeyObject): MonkeyObject {
        this.store.set(name, value);
        return value;
    }
}
