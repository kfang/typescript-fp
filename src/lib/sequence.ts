import { Optional } from "./optional";

export class Sequence<T> {

    public static of<T>(...items: T[]): Sequence<T> {
        return new Sequence<T>(items);
    }

    public static empty<T>(): Sequence<T> {
        return new Sequence<T>([]);
    }

    private readonly _arr: Array<T>;
    private constructor(_arr: Array<T>) {
        this._arr = _arr;
    }

    public [Symbol.iterator]() {
        return this._arr[Symbol.iterator];
    }

    public append(...items: T[]): Sequence<T> {
        const combined = [...this._arr, ...items];
        return new Sequence<T>(combined);
    }

    public at(pos: number): Optional<T> {
        return Optional.of(this._arr.at(pos));
    }

    public concat(...items: T[]): Sequence<T> {
        return this.append(...items);
    }

    public exists(predicate: (item: T, idx: number) => boolean): boolean {
        return this.some(predicate);
    }

    public every(predicate: (item: T, idx: number) => boolean): boolean {
        return this._arr.every(predicate);
    }

    public filter(predicate: (item: T, idx: number) => boolean): Sequence<T> {
        return new Sequence<T>(this._arr.filter(predicate));
    }

    public find(predicate: (item: T, idx: number) => boolean): Optional<T> {
        return Optional.of(this._arr.find(predicate));
    }

    public first(): Optional<T> {
        return Optional.of(this._arr[0]);
    }

    public head(): Optional<T> {
        return this.first();
    }

    public isEmpty(): boolean {
        return this._arr.length === 0;
    }

    public last(): Optional<T> {
        return Optional.of(this._arr[this.length() - 1]);
    }

    public length(): number {
        return this._arr.length;
    }

    public map<O>(cb: (item: T, idx: number) => O): Sequence<O> {
        const mapped = this._arr.map(cb);
        return new Sequence<O>(mapped);
    }

    public prepend(...items: T[]): Sequence<T> {
        const combined = [...items, ...this._arr];
        return new Sequence<T>(combined);
    }

    public reversed(): Sequence<T> {
        return new Sequence<T>([...this._arr].reverse());
    }

    public some(predicate: (item: T, idx: number) => boolean): boolean {
        return this._arr.some(predicate);
    }

    public sorted(): Sequence<T> {
        return new Sequence<T>([...this._arr].sort());
    }

    public tail(): Sequence<T> {
        const [, ...tail] = this._arr;
        return new Sequence<T>([...tail]);
    }

    public toArray(): Array<T> {
        return this._arr;
    }
}