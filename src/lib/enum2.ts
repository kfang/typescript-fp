import { Optional } from "./optional";

abstract class EnumEntry<T = unknown> {
    public readonly value: T;
    protected constructor(value: T) {
        this.value = value;
    }
}

type Inner<E> = E extends EnumEntry<infer T> ? T : never;

interface IEnumExtras<E extends EnumEntry<T>, T> {
    entries: E[];
    values: T[];
    withValue: (value: T) => Optional<E>;
}

type Ctor<E extends EnumEntry> = { new (...args: never[]): E };
type CtorEnum<C> = C extends Ctor<infer E> ? E : never;
type CtorEnumValue<C> = CtorEnum<C> extends EnumEntry<infer T> ? T : never;

type Enumeration<C, E extends EnumEntry<T>, T> = C & IEnumExtras<E, T>;

function seal<C extends Ctor<E>, T extends CtorEnumValue<C>, E extends EnumEntry<T> = CtorEnum<C>>(
    c: C,
): Enumeration<C, E, T> {
    const entries: E[] = [];
    const values: Inner<E>[] = [];

    Object.values(c).forEach((v) => {
        if (v instanceof EnumEntry) {
            Object.freeze(v);
            entries.push((v as unknown) as E);
            values.push(v.value);
        }
    });

    const e = Object.assign(c, {
        entries,
        values,
        withValue: () => Optional.empty<E>(),
    });

    return Object.freeze(e);
}

class Color extends EnumEntry<string> {
    public static red = "RED";
    public static blue = "BLUE";

    public static RED = new Color("red");
    public static BLUE = new Color("blue");
    public static YELLOW = new Color("yellow");

    constructor(value: string) {
        super(value);
    }

    public upper(): string {
        return this.value.toUpperCase();
    }
}

const Colors = seal(Color);

console.log(Colors.entries.map((c) => c.upper()));
