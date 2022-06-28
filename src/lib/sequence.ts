import { Optional } from "./optional";

export type Predicate<T> = (item: T, idx: number) => boolean;

export class Sequence<T1> {

    public static of<T>(...items: T[]): Sequence<T> {
        return new Sequence<T>(items);
    }

    public static empty<T>(): Sequence<T> {
        return new Sequence<T>([]);
    }

    private readonly _arr: Array<T1>;
    private constructor(_arr: Array<T1>) {
        this._arr = _arr;
    }

    public [Symbol.iterator]() {
        return this._arr[Symbol.iterator];
    }

    public append(...items: T1[]): Sequence<T1> {
        const combined = [...this._arr, ...items];
        return new Sequence<T1>(combined);
    }

    public at(pos: number): Optional<T1> {
        return Optional.of(this._arr.at(pos));
    }

    public concat(...items: T1[]): Sequence<T1> {
        return this.append(...items);
    }

    public contains(item: T1): boolean {
        return this.includes(item);
    }

    public exists(predicate: Predicate<T1>): boolean {
        return this.some(predicate);
    }

    public every(predicate: Predicate<T1>): boolean {
        return this._arr.every(predicate);
    }

    public filter(predicate: Predicate<T1>): Sequence<T1> {
        return new Sequence<T1>(this._arr.filter(predicate));
    }

    public find(predicate: Predicate<T1>): Optional<T1> {
        return Optional.of(this._arr.find(predicate));
    }

    public findFirst(predicate: Predicate<T1>): Optional<T1> {
        return this.find(predicate);
    }

    public findLast(predicate: Predicate<T1>): Optional<T1> {
        return this.findLastIndex(predicate).map((idx) => this._arr[idx]);
    }

    public findLastIndex(predicate: Predicate<T1>): Optional<number> {
        for (let idx = this._arr.length - 1; idx >= 0; idx--) {
            if (predicate(this._arr[idx], idx)) {
                return Optional.of(idx);
            }
        }
        return Optional.empty();
    }

    public findIndex(predicate: (item: T1, idx: number) => boolean): Optional<number> {
        const pos = this._arr.findIndex(predicate);
        return pos === -1 ? Optional.empty() : Optional.of(pos);
    }

    public first(): Optional<T1> {
        return Optional.of(this._arr[0]);
    }

    public forEach(cb: (item: T1, idx: number) => void): void {
        this._arr.forEach(cb);
    }

    public flatMap<T2>(cb: (item: T1, idx: number) => T2[]): Sequence<T2> {
        const res = this._arr.flatMap(cb);
        return new Sequence<T2>(res);
    }

    public head(): Optional<T1> {
        return this.first();
    }

    public includes(item: T1): boolean {
        return this._arr.includes(item);
    }

    public isEmpty(): boolean {
        return this._arr.length === 0;
    }

    public last(): Optional<T1> {
        return Optional.of(this._arr[this.length() - 1]);
    }

    public length(): number {
        return this._arr.length;
    }

    public map<O>(cb: (item: T1, idx: number) => O): Sequence<O> {
        const mapped = this._arr.map(cb);
        return new Sequence<O>(mapped);
    }

    public prepend(...items: T1[]): Sequence<T1> {
        const combined = [...items, ...this._arr];
        return new Sequence<T1>(combined);
    }

    public reversed(): Sequence<T1> {
        return new Sequence<T1>([...this._arr].reverse());
    }

    public some(predicate: (item: T1, idx: number) => boolean): boolean {
        return this._arr.some(predicate);
    }

    public sorted(): Sequence<T1> {
        return new Sequence<T1>([...this._arr].sort());
    }

    public tail(): Sequence<T1> {
        const [, ...tail] = this._arr;
        return new Sequence<T1>([...tail]);
    }

    public toArray(): Array<T1> {
        return this._arr;
    }

    public distinct(): Sequence<T1> {
        const res = new Set(this._arr);
        return new Sequence([...res]);
    }
}