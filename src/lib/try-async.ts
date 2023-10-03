import { Monad } from "./fantasy";
import { Try } from "./try";

export class TryAsync<A> implements Monad<A> {
    public static of<B>(value: B | Promise<B>): TryAsync<B> {
        const promiseTry = Promise.resolve(value)
            .then(Try.success)
            .catch((e) => Try.failure<B>(e));
        return new TryAsync<B>(promiseTry);
    }

    public static success<B>(value: B): TryAsync<B> {
        return new TryAsync<B>(Promise.resolve(Try.success(value)));
    }

    public static failure<B>(error: Error): TryAsync<B> {
        return new TryAsync<B>(Promise.resolve(Try.failure(error)));
    }

    public static wrap<B>(pTryB: Promise<Try<B>>): TryAsync<B> {
        return new TryAsync<B>(pTryB);
    }

    /**
     * returns an array that keeps only the successful values of an array of TryAsync
     * ```
     * const arr = [Promise.resolve(1), Promise.reject("bad")].map(TryAsync.of);
     * await TryAsync.flatten(arr) // => [1]
     * ```
     * @param {Try<B>[]} arr
     */
    public static flatten<B>(arr: TryAsync<B>[]): Promise<B[]> {
        return Promise.all(arr.map((t) => t.promise())).then(Try.flatten);
    }

    /**
     * Takes an array of TryAsync<B> and returns a single TryAsync containing all the inner values as B[]
     * if they are all successful.
     *
     * @example TryAsync.all([TryAsync.success(1), TryAsync.success(2), TryAsync.success(3)])     => TryAsync.success([1, 2, 3])
     * @example TryAsync.all([TryAsync.success(1), TryAsync.failure(error), TryAsync.success(3)]  => TryAsync.failure(error)
     * @param {TryAsync<B>[]>} arr - array of TryAsync
     */
    public static all<B>(arr: TryAsync<B>[]): TryAsync<B[]> {
        return arr.reduce((prev, curr) => {
            return prev.flatMap((bxs) => {
                return curr.map((b) => {
                    bxs.push(b);
                    return bxs;
                });
            });
        }, TryAsync.success<B[]>([]));
    }

    /**
     * utility for TryAsync.success<void>(undefined)
     * ```
     * TryAsync.void();
     * ```
     * @return {TryAsync<void>}
     */
    public static void(): TryAsync<void> {
        return new TryAsync(Promise.resolve(Try.success<void>(undefined)));
    }

    private readonly value: Promise<Try<A>>;

    private constructor(value: Promise<Try<A>>) {
        this.value = value;
    }

    public ap<B>(b: TryAsync<(a: A) => B>): TryAsync<B> {
        return b.chain((fn) => {
            const pTryB = this.value.then((tryA) => tryA.map(fn));
            return new TryAsync(pTryB);
        });
    }

    public map<B>(fn: (value: A) => B): TryAsync<B> {
        const pTryB = this.value.then((tryA) => tryA.map(fn)).catch((error) => Try.failure<B>(error));
        return new TryAsync<B>(pTryB);
    }

    public chain<B>(fn: (value: A) => TryAsync<B>): TryAsync<B> {
        const pTryB = this.value
            .then((tryA) => {
                if (tryA.isFailure()) {
                    return Try.failure<B>(tryA.error);
                } else {
                    return fn(tryA.get()).promise();
                }
            })
            .catch((error) => Try.failure<B>(error));
        return new TryAsync<B>(pTryB);
    }

    public flatMap<B>(fn: (value: A) => TryAsync<B>): TryAsync<B> {
        return this.chain(fn);
    }

    public mapAsync<B>(fn: (value: A) => Promise<B>): TryAsync<B> {
        const pTryB = this.value.then((tryA) => tryA.pMap(fn)).catch((error) => Try.failure<B>(error));
        return new TryAsync<B>(pTryB);
    }

    public recover(fn: (error: Error) => A): TryAsync<A> {
        const pTryA = this.value.then((tryA) => tryA.recover(fn)).catch((e) => Try.failure<A>(e));
        return new TryAsync(pTryA);
    }

    public recoverWith(fn: (error: Error) => TryAsync<A>): TryAsync<A> {
        const pTryA = this.value
            .then((tryA: Try<A>) => {
                if (tryA.isFailure()) {
                    return fn(tryA.error).promise();
                } else {
                    return TryAsync.success(tryA.get()).promise();
                }
            })
            .catch((e) => Try.failure<A>(e));
        return new TryAsync(pTryA);
    }

    public case<B>(predicates: {
        success: (value: A) => TryAsync<B>;
        failure: (error: Error) => TryAsync<B>;
    }): TryAsync<B> {
        const pOptB = this.value.then((tryA) => {
            if (tryA.isFailure()) {
                return predicates.failure(tryA.error).promise();
            } else {
                return predicates.success(tryA.get()).promise();
            }
        });
        return new TryAsync(pOptB);
    }

    public promise(): Promise<Try<A>> {
        return this.value;
    }

    /**
     * Maps the resolved value to `void` (undefined in this case). In other words, basically just throws away the
     * resolved value. If this is a {@link Failure}, then it will continue to pass along the failure.
     */
    public void(): TryAsync<void> {
        return this.map<void>(() => undefined);
    }

    public get(): Promise<A> {
        return this.promise().then((result) => result.get());
    }
}
