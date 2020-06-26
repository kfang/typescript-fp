import { Optional } from "./optional";
import { TryAsync } from "./try-async";

export abstract class Try<A> {
    public static isSuccess<B>(t: Try<B>): t is Success<B> {
        return t.isSuccess();
    }

    public static isFailure<B>(t: Try<B>): t is Failure<B> {
        return t.isFailure();
    }

    public static of<B>(fn: () => B): Try<B> {
        try {
            const value = fn();
            return new Success(value);
        } catch (error) {
            return new Failure(error);
        }
    }

    public static pOf<B>(fn: () => Promise<B>): Promise<Try<B>> {
        try {
            return fn()
                .then((v) => new Success(v))
                .catch((e) => new Failure(e));
        } catch (e) {
            return Promise.resolve(new Failure(e));
        }
    }

    public static failure<B>(error: Error): Try<B> {
        return new Failure(error);
    }

    public static success<B>(b: B): Try<B> {
        return new Success(b);
    }

    public abstract readonly isSuccess: () => this is Success<A>;
    public abstract readonly isFailure: () => this is Failure<A>;
    public abstract readonly get: () => A;
    public abstract readonly getOrElse: (defaultValue: A) => A;
    public abstract readonly toOptional: () => Optional<A>;

    public abstract readonly map: <B>(fn: (a: A) => B) => Try<B>;
    public abstract readonly flatMap: <B>(fn: (a: A) => Try<B>) => Try<B>;

    public abstract readonly pMap: <B>(fn: (a: A) => Promise<B>) => Promise<Try<B>>;
    public abstract readonly pFlatMap: <B>(fn: (a: A) => Promise<Try<B>>) => Promise<Try<B>>;

    public abstract readonly recover: (fn: (e: Error) => A) => Try<A>;
    public abstract readonly recoverWith: (fn: (e: Error) => Try<A>) => Try<A>;

    public abstract readonly async: () => TryAsync<A>;
}

export class Failure<A> extends Try<A> {
    public readonly error: Error;

    constructor(e: Error) {
        super();
        this.error = e;
    }

    public readonly isSuccess = (): boolean => false;
    public readonly isFailure = (): boolean => true;
    public readonly get = (): A => {
        throw this.error;
    };
    public readonly getOrElse = (defaultValue: A): A => defaultValue;
    public readonly toOptional = (): Optional<A> => Optional.empty();
    public readonly recover = (fn: (e: Error) => A): Try<A> => new Success(fn(this.error));
    public readonly recoverWith = (fn: (e: Error) => Try<A>): Try<A> => fn(this.error);

    public readonly map = <B>(): Try<B> => {
        return new Failure<B>(this.error);
    };

    public readonly flatMap = <B>(): Try<B> => {
        return new Failure<B>(this.error);
    };

    public readonly pMap = <B>(): Promise<Try<B>> => {
        return Promise.resolve(Try.failure(this.error));
    };

    public readonly pFlatMap = <B>(): Promise<Try<B>> => {
        return Promise.resolve(Try.failure(this.error));
    };

    public readonly async = (): TryAsync<A> => TryAsync.failure<A>(this.error);
}

export class Success<A> extends Try<A> {
    public readonly value: A;

    constructor(v: A) {
        super();
        this.value = v;
    }

    public readonly isSuccess = (): boolean => true;
    public readonly isFailure = (): boolean => false;
    public readonly get = (): A => this.value;
    public readonly getOrElse = (): A => this.value;
    public readonly toOptional = (): Optional<A> => Optional.of(this.value);
    public readonly recover = (): Try<A> => this;
    public readonly recoverWith = (): Try<A> => this;

    public readonly map = <B>(fn: (a: A) => B): Try<B> => {
        return new Success<B>(fn(this.value));
    };

    public readonly flatMap = <B>(fn: (a: A) => Try<B>): Try<B> => {
        return fn(this.value);
    };

    public readonly pMap = <B>(fn: (a: A) => Promise<B>): Promise<Try<B>> => {
        try {
            return fn(this.value)
                .then((b) => Try.success(b))
                .catch((e) => Try.failure(e));
        } catch (e) {
            return Promise.resolve(Try.failure(e));
        }
    };

    public readonly pFlatMap = <B>(fn: (a: A) => Promise<Try<B>>): Promise<Try<B>> => {
        try {
            return fn(this.value).catch((e) => Try.failure(e));
        } catch (e) {
            return Promise.resolve(Try.failure(e));
        }
    };

    public readonly async = (): TryAsync<A> => TryAsync.success<A>(this.value);
}
