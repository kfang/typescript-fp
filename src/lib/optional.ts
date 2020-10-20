import { Monad } from "./fantasy";
import { OptionalAsync } from "./optional-async";

/**
 * A container object which may or may not contain a non-null value.
 * If a value is present, isEmpty() will return true and get() will return the value.
 *
 * Some operations you can do:
 * ```
 * const result = Optional.of(1)
 *   .map(i => i + 1)                   // => Some(2)
 *   .map(i => i * i)                   // => Some(4)
 *   .flatMap(i => Optional.of(i - 1))  // => Some(3)
 *   .pMap(i => Promise.resolve(i));    // => Promise(Some(3))
 *
 * const result2 = await result;        // => Some(3)
 * result2.isEmpty()                    // => false
 * result2.contains(3)                  // => true
 * result2.get()                        // => 3
 *
 * const result3 = result2              // => Some(3)
 *   .flatMap(i => Optional.empty())    // => None
 * result3.get()                        // => throws Error()
 * result3.getOrElse(4)                 // => 4
 * ```
 */
export abstract class Optional<A> implements Monad<A> {
    public static of<B>(v: B | null | undefined): Optional<B> {
        if (v === null) {
            return new None<B>();
        }

        if (v === undefined) {
            return new None<B>();
        }

        return new Some<B>(v);
    }

    public static empty<B>(): Optional<B> {
        return new None<B>();
    }

    /**
     * returns an array that keeps only the non empty values of an array of Optionals
     * ```
     * const arr = [1, 2, undefined, 4, null, 6].map(Optional.of);
     * Optional.flatten(arr) // => [1, 2, 4, 6]
     * ```
     * @param {Optional<B>[]} arr
     */
    public static flatten<B>(arr: Optional<B>[]): B[] {
        return arr.filter((o) => !o.isEmpty()).map((o) => o.get());
    }

    public abstract ap<B>(b: Optional<(a: A) => B>): Optional<B>;

    /**
     * applies the function to the inner value if it exists.
     *
     * ```
     * const square = (v) => v * v;
     * const squareOf11 = Optional.of(11).map(square)
     * squareOf11.contains(121) // => true
     * ```
     *
     * @param {(A) => B} fn
     * @returns {Optional<B>}
     */
    public abstract map<B>(fn: (a: A) => B | null | undefined): Optional<B>;

    /**
     * applies the async function to the inner value if it exists. Swaps what
     * would have been an inner Promise to the outside.
     * @param {(A) => Promise<B>} fn
     * @returns {Promise<Optional<B>>}
     */
    public abstract pMap<B>(fn: (a: A) => Promise<B>): Promise<Optional<B>>;

    /**
     * applies the function to the inner value if it exists.
     * similar to `map` except the function should return an Optional and the final
     * result will be empty if the function returns an empty Optional.
     *
     * ```
     * Optional.of("hello")
     *   .flatMap(str => Optional.of(str + " world")) // => Some("hello world")
     *   .flatMap(str => Optional.of(null))           // => None
     * ```
     * @param {(A) => Optional<B>} fn
     * @returns {Optional<B>}
     */
    public abstract flatMap<B>(fn: (a: A) => Optional<B>): Optional<B>;

    public chain<B>(fn: (a: A) => Optional<B>): Optional<B> {
        return this.flatMap(fn);
    }

    /**
     * returns the inner value
     *
     * ```
     * Optional.of(undefined).get()     // => throws Error
     * Optional.of(null).get()          // => throws Error
     * Optional.of("hello world").get() // => "hello world"
     * ```
     *
     * @throws {Error} when trying to get a value of an empty Optional
     */
    public abstract get(): A;

    /**
     * returns the inner value if it exists, otherwise returns the passed in value
     *
     * ```
     * Optional.empty().getOrElse("default")            // => "default"
     * Optional.of("hello world").getOrElse("default")  // => "hello world"
     * ```
     *
     * @param d the default value to return if the Optional is empty
     */
    public abstract getOrElse(d: A): A;

    /**
     * returns the inner value if it exists, otherwise throws with given error
     * ```
     * const error = new Error("my descriptive error")
     * Optional.empty().getOrThrow(error)             // => ERROR: Error: my descriptive error
     * Optional.of("hellow world").getOrThrow(error)  // => "hello world"
     * ```
     * @param {Error} error - error object to throw
     */
    public abstract getOrThrow(error: Error): A;

    /**
     * returns the inner value if it exists, otherwise returns null
     * ```
     * Optional.empty().getOrNull()     // => null
     * Optional.of("HELLO").getOrNull() // => "HELLO"
     */
    public abstract getOrNull(): A | null;

    /**
     * returns the inner value if it exists, otherwise returns undefined
     * ```
     * Optional.empty().getOrNull()     // => undefined
     * Optional.of("HELLO").getOrNull() // => "HELLO"
     */
    public abstract getOrUndefined(): A | undefined;

    /**
     * returns whether or not the Optional's inner value is equal to what is
     * passed in. Uses `===`
     *
     * ```
     * Optional.of("hello world").contains("hello world")   // => true
     * Optional.empty().contains("hello world")             // => false
     * ```
     * @param v
     */
    public abstract contains(v: A): boolean;

    /**
     * returns true if this Optional contains `undefined` or `null`, false otherwise.
     *
     * ```
     * Optional.of("hello world").isEmpty() // => false
     * Optional.of(0).isEmpty()             // => false
     * Optional.of({}).isEmpty()            // => false
     * Optional.of([]).isEmpty()            // => false
     * Optional.empty().isEmpty()           // => true
     * Optional.of(null).isEmpty()          // => true
     * Optional.of(undefined).isEmpty()     // => true
     *
     * ```
     */
    public abstract isEmpty(): boolean;

    /**
     * returns true if this Optional is not empty and the function passed in returns true. Otherwise
     * returns false
     * @param {(A) => boolean} fn - existance function
     */
    public abstract exists(fn: (v: A) => boolean): boolean;

    /**
     * converts this Optional into an OptionalAsync to make it easier to work with async functions.
     */
    public abstract async(): OptionalAsync<A>;

    public abstract case<B>(predicates: { some: (value: A) => Optional<B>; none: () => Optional<B> }): Optional<B>;
}

export class Some<A> extends Optional<A> {
    private readonly a: A;

    constructor(v: A) {
        super();
        if (v === null || v === undefined) {
            throw new Error("can't construct a 'Some' with an empty value");
        }
        this.a = v;
    }

    public ap<B>(b: Optional<(a: A) => B>): Optional<B> {
        return b.map((fn) => fn(this.a));
    }

    public contains(v: A): boolean {
        return v === this.a;
    }

    public exists(fn: (v: A) => boolean): boolean {
        return fn(this.a);
    }

    public flatMap<B>(fn: (a: A) => Optional<B>): Optional<B> {
        return fn(this.a);
    }

    public get(): A {
        return this.a;
    }

    public getOrElse(): A {
        return this.a;
    }

    public getOrThrow(): A {
        return this.a;
    }

    public getOrNull(): A | null {
        return this.a;
    }

    public getOrUndefined(): A | undefined {
        return this.a;
    }

    public isEmpty(): boolean {
        return false;
    }

    public map<B>(fn: (a: A) => B | null | undefined): Optional<B> {
        return Optional.of(fn(this.a));
    }

    public pMap<B>(fn: (a: A) => Promise<B>): Promise<Optional<B>> {
        return fn(this.a).then((b) => Optional.of(b));
    }

    public async(): OptionalAsync<A> {
        return OptionalAsync.of(this.a);
    }

    public case<B>(predicates: { some: (value: A) => Optional<B>; none: () => Optional<B> }): Optional<B> {
        return predicates.some(this.a);
    }
}

export class None<A> extends Optional<A> {
    constructor() {
        super();
    }

    public ap<B>(): Optional<B> {
        return new None<B>();
    }

    public contains(): boolean {
        return false;
    }

    public exists(): boolean {
        return false;
    }

    public flatMap<B>(): Optional<B> {
        return new None<B>();
    }

    public get(): A {
        throw new Error("called get on an empty Optional");
    }

    public getOrElse(d: A): A {
        return d;
    }

    public getOrThrow(error: Error): A {
        throw error;
    }

    public getOrNull(): A | null {
        return null;
    }

    public getOrUndefined(): A | undefined {
        return undefined;
    }

    public isEmpty(): boolean {
        return true;
    }

    public map<B>(): Optional<B> {
        return new None<B>();
    }

    public pMap<B>(): Promise<Optional<B>> {
        return Promise.resolve(new None<B>());
    }

    public async(): OptionalAsync<A> {
        return OptionalAsync.empty<A>();
    }

    public case<B>(predicates: { some: (value: A) => Optional<B>; none: () => Optional<B> }): Optional<B> {
        return predicates.none();
    }
}
