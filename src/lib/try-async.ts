import { Try } from "./try";

type Inner<T> = T extends TryAsync<infer A> ? A : never;

export class TryAsync<A> {
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

    public static all<
        T extends { [k: string]: TryAsync<any> },
        Res extends TryAsync<{ [k in keyof T]: Inner<T[k]> }>
    >(obj: T): Res {
        return Object.keys(obj).reduce((res, key) => {
            return res.flatMap((final) => {
                return obj[key].map((value) => ({ ...final, [key]: value }));
            });
        }, TryAsync.success({})) as unknown as Res;
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

    private readonly value: Promise<Try<A>>;

    private constructor(value: Promise<Try<A>>) {
        this.value = value;
    }

    public map<B>(fn: (value: A) => B): TryAsync<B> {
        const pTryB = this.value.then((tryA) => tryA.map(fn)).catch((error) => Try.failure<B>(error));
        return new TryAsync<B>(pTryB);
    }

    public flatMap<B>(fn: (value: A) => TryAsync<B>): TryAsync<B> {
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

    public promise(): Promise<Try<A>> {
        return this.value;
    }
}
