import { Optional } from "./optional";

type Ctor<E extends EnumEntry> = { new (...args: never[]): E };
type CtorEnum<C> = C extends Ctor<infer E> ? E : never;
type CtorEnumValue<C> = CtorEnum<C> extends EnumEntry<infer T> ? T : never;

interface IEnumeration<E extends EnumEntry<T>, T> {
    entries: E[];
    values: T[];
    withName: (name: string) => Optional<E>;
    withValue: (value: T) => Optional<E>;
}

export type Enumeration<C, E extends EnumEntry<T>, T> = C & IEnumeration<E, T>;

export abstract class EnumEntry<T = unknown> {
    public static seal<C extends Ctor<E>, T extends CtorEnumValue<C>, E extends EnumEntry<T> = CtorEnum<C>>(
        c: C,
    ): Enumeration<C, E, T> {
        const entries: E[] = [];
        const values: T[] = [];
        const nameValueMap: Record<string, E> = {};

        Object.entries(c).forEach(([name, value]) => {
            if (value instanceof EnumEntry) {
                Object.freeze(value);
                entries.push((value as unknown) as E);
                values.push(value.value);
                nameValueMap[name] = value as E;
            }
        });

        const withValue = (v: T): Optional<E> => {
            return Optional.of(entries.find((e) => e.value === v));
        };

        const withName = (name: string): Optional<E> => {
            return Optional.of(nameValueMap[name]);
        };

        const e = Object.defineProperties(c, {
            entries: {
                configurable: false,
                enumerable: false,
                value: entries,
                writable: false,
            },
            values: {
                configurable: false,
                enumerable: false,
                value: values,
                writable: false,
            },
            withName: {
                configurable: false,
                enumerable: false,
                value: withName,
                writable: false,
            },
            withValue: {
                configurable: false,
                enumerable: false,
                value: withValue,
                writable: false,
            },
        });

        return Object.freeze(e);
    }

    public readonly value: T;

    protected constructor(value: T) {
        this.value = value;
    }
}
