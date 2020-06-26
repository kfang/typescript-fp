import { Try } from './try';

export class TryAsync<A> {
    public static of<B>(value: Promise<B>): TryAsync<B> {
        const promiseTry = value.then(Try.success).catch((e) => Try.failure<B>(e));
        return new TryAsync<B>(promiseTry);
    }

    public static success<B>(value: B): TryAsync<B> {
        return new TryAsync<B>(Promise.resolve(Try.success(value)));
    }

    public static failure<B>(error: Error): TryAsync<B> {
        return new TryAsync<B>(Promise.resolve(Try.failure(error)));
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

    public promise(): Promise<Try<A>> {
        return this.value;
    }
}
