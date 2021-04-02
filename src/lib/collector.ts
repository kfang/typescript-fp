import { TryAsync } from "./try-async";
import { Monad } from "./fantasy";
import { Try } from "./try";

abstract class Collector<O extends Record<string, unknown>> {

    public static forTry<R extends Record<string, unknown>>(init: R): TryCollector<R> {
        return new TryCollector<R>(Try.of(() => init));
    }

    public static forTryAsync<R extends Record<string, unknown>>(init: R | Promise<R>): TryAsyncCollector<R> {
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
