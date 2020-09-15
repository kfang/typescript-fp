import { Optional } from "./optional";
import { TryAsync } from "./try-async";

/**
 * Try is a monadic container type which represents a computation that may either result in an exception,
 * or return a successfully computed value. Instances of Try, are either an instance of Success or Failure.
 *
 * An important property of Try is its ability to pipeline, or chain, operations, catching exceptions along the way.
 * The {@link Try.flatMap} and {@link Try.map} combinators each essentially pass off either their successfully completed
 * value, wrapped in a Success type for it to be further operated upon by the next combinator in the chain, or the
 * exception wrapped in a Failure type usually to be simply passed on down the chain. Combinators such as
 * {@link Try.recover} are designed to provide some type of default behavior in the case of failure.
 *
 * lets say you have a function that might return an error:
 * ```
 * function foobar(): number {
 *   const n = Math.random();
 *   return n > 0.5 ? n : throw new Error("you were unlucky");
 * }
 * ```
 *
 * case 1: foobar() returns 0.7
 * ```
 * const result = Try.of(foobar)        // => Success(0.7)
 *   .map((n) => n + 1)                 // => Success(1.7)
 *   .flatMap((n) => Try.success(n -2)) // => Success(-1.7)
 *   .recover((e) => 0.0)               // => Success(-1.7)
 *   .get();                            // => -1.7
 *
 * assert(result, -1.7)
 * ```
 *
 * case 2: foobar() throws an error
 * ```
 * const result = Try.of(foobar)        // => Failure("you were unlucky")
 *   .map((n) => n + 1)                 // => Failure("you were unlucky")
 *   .flatMap((n) => Try.success(n -2)) // => Failure("you were unlucky")
 *   .recover((e) => 0.0)               // => Success(0.0)
 *   .get();                            // => 0.0
 * ```
 */
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

    /**
     * builds an instance of Failure directly
     * ```
     * Try.failure(new Error("error message"));
     * ```
     * @param {Error} error
     * @return {Try<B>}
     */
    public static failure<B>(error: Error): Try<B> {
        return new Failure(error);
    }

    /**
     * builds an instance of Success directly
     * ```
     * Try.success({foo: "bar"});
     * ```
     * @param {B} b
     * @return {Try<B>}
     */
    public static success<B>(b: B): Try<B> {
        return new Success(b);
    }

    public abstract readonly isSuccess: () => this is Success<A>;
    public abstract readonly isFailure: () => this is Failure<A>;
    public abstract readonly get: () => A;
    public abstract readonly getOrElse: (defaultValue: A) => A;
    public abstract readonly toOptional: () => Optional<A>;

    /**
     * applies the function to the success value
     * ```
     * const fn = (str) => str + " world";
     * Try.success("hello").map(fn);                // Success("hello world")
     * Try.failure<string>(new Error()).map(fn);    // Failure()
     * ```
     * @param {(a: A) => B} fn - function to apply to the success value
     * @return {Try<B>}
     */
    public abstract readonly map: <B>(fn: (a: A) => B) => Try<B>;

    /**
     * applies the function that returns a `Try` to the success value and flattens over
     * the result so you don't get a `Try` within a `Try`.
     *
     *```
     * const fn = (str) => Try.success(str + "world");
     * Try.success("hello").flatMap(fn);                    // Success("hello world");
     * Try.failure<string>(new Error()).flatMap(fn);        // Failure()
     *
     * @param {(a: A) => Try<B>} fn - function to apply to the success value
     * @return {Try<B>}
     */
    public abstract readonly flatMap: <B>(fn: (a: A) => Try<B>) => Try<B>;

    /**
     * simliar to map except the function being applied returns a {@link Promise}.
     * This is useful if you need to return something async inside the mapping function.
     *
     * ```
     * const fn = (str: string): Promise<string> => Promise.resolve(str + " world");
     * Try.success("hello").pMap(fn); // Promise<Sucess("hello world")>
     * ```
     *
     * If the mapping function throws, the result will automatically converted to a Failure.
     * If the mapping function's Promise rejects, the result will be converted toa Failure.
     * ```
     * Try.success("hello").pMap(async () => throw new Error());        // Promise<Failure>
     * Try.success("hello").pMap(() => Promise.reject(new Error()));    // Promise<Failure>
     * ```
     *
     * However, most of the time, you should just use {@link Try.async()} in order to deal with
     * asynchronous operations.
     */
    public abstract readonly pMap: <B>(fn: (a: A) => Promise<B>) => Promise<Try<B>>;

    /**
     * similar to flatMap except the function being applied returns a Promise<Try>.
     * This is useful if the mapping function returns a Promise<Try>.
     */
    public abstract readonly pFlatMap: <B>(fn: (a: A) => Promise<Try<B>>) => Promise<Try<B>>;

    /**
     * applies the function to to an error. The function is only called if this is a Failure.
     * This is useful if you want to provide a default value on a failure based on the error.
     * ```
     * Try.failure(new Error()).recover(() => "Hello World!");  // Success("Hello World!")
     * ```
     */
    public abstract readonly recover: (fn: (e: Error) => A) => Try<A>;

    /**
     * similar to {@link Try.recoverWith} except that the function returns a Try.
     * This is useful if you want remap the error into a different error or provide
     * a default value.
     * ```
     * const fn = (error: Error) => {
     *   return error.message === "bad bad bad" ? Try.success("okay") : Try.failure(new Error("not okay"));
     * }
     *
     * Try.failure(new Error("bad bad bad")).recoverWith(fn);   // Success("okay");
     * Try.failure(new Error("bad")).recoverWith(fn);           // Failure(new Error("not okay"));
     */
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
        try {
            return new Success(fn(this.value));
        } catch (e) {
            return new Failure(e);
        }
    };

    public readonly flatMap = <B>(fn: (a: A) => Try<B>): Try<B> => {
        try {
            return fn(this.value);
        } catch (e) {
            return new Failure(e);
        }
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
