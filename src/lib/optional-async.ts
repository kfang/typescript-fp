import { Monad } from "./fantasy";
import { Optional } from "./optional";

export class OptionalAsync<A> implements Monad<A> {
    public static of<T>(t: T | null | undefined | Promise<T | null | undefined>): OptionalAsync<T> {
        const pOpt = Promise.resolve(t).then(Optional.of);
        return new OptionalAsync(pOpt);
    }

    public static empty<T>(): OptionalAsync<T> {
        const pOpt = Promise.resolve(Optional.empty<T>());
        return new OptionalAsync(pOpt);
    }

    /**
     * returns a Promise containing an array that keeps only the non empty values of an array of OptionalAsyncs
     * ```
     * const arr = [1, 2, undefined, 4, null, 6].map(OptionalAsync.of);
     * await OptionalAsync.flatten(arr) // => [1, 2, 4, 6]
     * ```
     * @param {Optional<B>[]} arr
     */
    public static flatten<T>(arr: OptionalAsync<T>[]): Promise<T[]> {
        return Promise.all(arr.map((opt) => opt.promise())).then(Optional.flatten);
    }

    public static all<T>(optxs: OptionalAsync<T>[]): OptionalAsync<T[]> {
        return optxs.reduce((prev, curr) => {
            return curr.flatMap((t) => {
                return prev.map((arr) => {
                    arr.push(t);
                    return arr;
                });
            });
        }, OptionalAsync.of<T[]>([]));
    }

    private readonly pOptA: Promise<Optional<A>>;

    private constructor(pOpt: Promise<Optional<A>>) {
        this.pOptA = pOpt;
    }

    public ap<B>(b: OptionalAsync<(a: A) => B>): OptionalAsync<B> {
        return b.chain((fn) => {
            const pOptB = this.pOptA.then((optA) => optA.map(fn));
            return new OptionalAsync(pOptB);
        });
    }

    public map<B>(fn: (a: A) => B | null | undefined): OptionalAsync<B> {
        const pOptB = this.pOptA.then((optA) => optA.map(fn));
        return new OptionalAsync(pOptB);
    }

    public mapAsync<B>(fn: (a: A) => Promise<B | null | undefined>): OptionalAsync<B> {
        const pOptB = this.pOptA.then((optA) => {
            if (optA.isEmpty()) {
                return Optional.empty<B>();
            }
            return fn(optA.get()).then(Optional.of);
        });
        return new OptionalAsync(pOptB);
    }

    public chain<B>(fn: (a: A) => OptionalAsync<B>): OptionalAsync<B> {
        const pOptB: Promise<Optional<B>> = this.pOptA.then((optA) => {
            if (optA.isEmpty()) {
                return Optional.empty<B>();
            }
            return fn(optA.get()).promise();
        });
        return new OptionalAsync(pOptB);
    }

    public flatMap<B>(fn: (a: A) => OptionalAsync<B>): OptionalAsync<B> {
        return this.chain(fn);
    }

    public getOrElse(defaultValue: A): Promise<A> {
        return this.pOptA.then((optA) => optA.getOrElse(defaultValue));
    }

    public get(): Promise<A> {
        return this.pOptA.then((optA) => optA.get());
    }

    public getOrThrow(error: Error): Promise<A> {
        return this.pOptA.then((optA) => optA.getOrThrow(error));
    }

    public getOrNull(): Promise<A | null> {
        return this.pOptA.then((optA) => optA.getOrNull());
    }

    public getOrUndefined(): Promise<A | undefined> {
        return this.pOptA.then((optA) => optA.getOrUndefined());
    }

    public contains(value: A): Promise<boolean> {
        return this.pOptA.then((optA) => optA.contains(value));
    }

    public exists(check: (value: A) => boolean): Promise<boolean> {
        return this.pOptA.then((optA) => optA.exists(check));
    }

    public promise(): Promise<Optional<A>> {
        return this.pOptA;
    }

    public case<B>(predicates: {
        some: (value: A) => OptionalAsync<B>;
        none: () => OptionalAsync<B>;
    }): OptionalAsync<B> {
        const pOptB = this.pOptA.then((optA) => {
            if (optA.isEmpty()) {
                return predicates.none().promise();
            } else {
                return predicates.some(optA.get()).promise();
            }
        });
        return new OptionalAsync(pOptB);
    }
}

export const OptAsync: typeof OptionalAsync = OptionalAsync;
