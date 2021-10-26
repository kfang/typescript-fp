import { TryAsync } from "./try-async";
import { Monad } from "./fantasy";
import { Try } from "./try";

/**
 * Collectors allow you to chain and "rollup" monadic containers without having to return
 * everything passed in at each step. For example, consider you have a sequence of functions
 * you need to call:
 *
 * ```typescript
 * function getApple(): Try<"apple">;
 * function getBanana(): Try<"banana">;
 * function getPear(): Try<"pear">;
 * ```
 *
 * You want the result to be an object that contains the result of all three functions in the
 * form: `{ apple: "apple", banana: "banana", pear: "pear" }`.
 *
 * You could do this by chaining flatMap together but you would have to generate the object as the
 * return in each of the functions so that the signatures look somthing like this:
 *
 * ```typescript
 * function getApple(): Try<{ apple: "apple" }>;
 * function getBanana(prev: { apple: "apple" }): Try<{apple: "apple", banana: "banana"}>;
 * ```
 *
 * The alternative is to unwrap each monadic container and wrap everything at the end. This
 * is not trivial to do and introduces a lot of weird edge cases.  Instead, we can use a
 * Collector to "collect" these values together:
 *
 * ```typescript
 * const result = Collector.forTry()
 *   .fold("apple", getApple)
 *   .fold("banana", getBanana)
 *   .fold("pear", getPear)
 *   .yield();
 *
 * result.get();
 * ```
 */
export abstract class Collector<O extends Record<string, unknown>> {

    public static forTry<R extends Record<string, unknown>>(init: R = {} as R): TryCollector<R> {
        return new TryCollector<R>(Try.of(() => init));
    }

    public static forTryAsync<R extends Record<string, unknown>>(init: R | Promise<R> = {} as R): TryAsyncCollector<R> {
        return new TryAsyncCollector<R>(TryAsync.of(init));
    }

    protected readonly output: Monad<O>;

    protected constructor(init: Monad<O>) {
        this.output = init;
    }

    protected monadicFold<K extends string, V>(key: K, fn: (o: O) => Monad<V>): Monad<O & Record<K, V>> {
        return this.output.flatMap((output) => {
            return fn(output).map((value) => {
                return {
                    ...output,
                    [key]: value,
                };
            });
        });
    }
}

class TryAsyncCollector<O extends Record<string, unknown>> extends Collector<O> {
    public fold<K extends string, V, R extends O & Record<K, V>>(key: K, fn: (o: O) => TryAsync<V>): TryAsyncCollector<R> {
        const out = this.monadicFold(key, fn) as TryAsync<R>;
        return new TryAsyncCollector<R>(out);
    }

    public yield(): TryAsync<O> {
        return this.output as TryAsync<O>;
    }
}

class TryCollector<O extends Record<string, unknown>> extends Collector<O> {
    public fold<K extends string, V, R extends O & Record<K, V>>(key: K, fn: (o: O) => Try<V>): TryCollector<R> {
        const out = this.monadicFold(key, fn) as Try<R>;
        return new TryCollector<R>(out);
    }

    public yield(): Try<O> {
        return this.output as Try<O>;
    }
}
