import { Optional } from "./optional";

export class OptionalAsync<A> {
    public static of<T>(t: T): OptionalAsync<T> {
        const pOpt = Promise.resolve(Optional.of(t));
        return new OptionalAsync(pOpt);
    }

    public static empty<T>(): OptionalAsync<T> {
        const pOpt = Promise.resolve(Optional.empty<T>());
        return new OptionalAsync(pOpt);
    }

    private readonly pOptA: Promise<Optional<A>>;

    private constructor(pOpt: Promise<Optional<A>>) {
        this.pOptA = pOpt;
    }

    public map<B>(fn: (a: A) => B): OptionalAsync<B> {
        const pOptB = this.pOptA.then((optA) => optA.map(fn));
        return new OptionalAsync(pOptB);
    }

    public mapAsync<B>(fn: (a: A) => Promise<B>): OptionalAsync<B> {
        const pOptB = this.pOptA.then((optA) => {
            if (optA.isEmpty()) {
                return Optional.empty<B>();
            }
            return fn(optA.get()).then(Optional.of);
        });
        return new OptionalAsync(pOptB);
    }

    public flatMap<B>(fn: (a: A) => OptionalAsync<B>): OptionalAsync<B> {
        const pOptB: Promise<Optional<B>> = this.pOptA.then((optA) => {
            if (optA.isEmpty()) {
                return Optional.empty<B>();
            }
            return fn(optA.get()).promise();
        });
        return new OptionalAsync(pOptB);
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
}
