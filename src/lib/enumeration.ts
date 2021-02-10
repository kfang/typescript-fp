import { Optional } from "./optional";

export class EnumEntry<T = unknown> {
    private readonly _value: T;
    private _name!: string;

    constructor(value: T) {
        this._value = value;
    }

    get value(): T {
        return this._value;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }
}

export type EnumMap<E extends EnumEntry> = Record<string, E>;
export type EnumValueType<E> = E extends EnumEntry<infer A> ? A : never;

export class Enumeration<E extends EnumEntry<T>, T> {
    public static fromEntries<E extends EnumEntry<T>, T = EnumValueType<E>>(
        enumMap: EnumMap<E>,
    ): Enumeration<E, T> & EnumMap<E> {
        // set name and freeze the EnumEntry so it cannot be changed
        Object.entries(enumMap).forEach(([name, entry]) => {
            entry.name = name;
            Object.freeze(entry);
        });

        // build out the descriptors that will be attached to the Enumeration instance
        const descriptorMap: PropertyDescriptorMap = {};
        Object.entries(enumMap).forEach(([name, entry]) => {
            descriptorMap[name] = {
                configurable: false,
                enumerable: true,
                value: entry,
                writable: false,
            };
        });

        const enumeration = Object.defineProperties(new Enumeration(enumMap), descriptorMap);
        return Object.freeze(enumeration);
    }

    private readonly _enumMap: EnumMap<E>;
    private readonly _enumEntries: E[];

    constructor(enumMap: EnumMap<E>) {
        this._enumMap = enumMap;
        this._enumEntries = Object.values(enumMap);
    }

    get entries(): E[] {
        return this._enumEntries;
    }

    get values(): T[] {
        return this._enumEntries.map((entry) => entry.value);
    }

    get names(): string[] {
        return this._enumEntries.map((entry) => entry.name);
    }

    public withName(name: string): Optional<E> {
        return Optional.of(this._enumMap[name]);
    }

    public withValue(value: EnumValueType<E>): Optional<E> {
        const entry = this._enumEntries.find((entry) => entry.value === value);
        return Optional.of(entry);
    }
}
