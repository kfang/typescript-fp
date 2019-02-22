/**
 * A container object which may or may not contain a non-null value.
 * If a value is present, isEmpty() will return true and get() will return the value.
 */
export class Optional<A> {
  public static flatten(o: {
    readonly [k: string]: Optional<any>;
  }): { readonly [k: string]: any } {
    return Object.keys(o).reduce((result, key) => {
      return o[key].isEmpty() ? result : { ...result, [key]: o[key].get() };
    }, {});
  }

  public static of<B>(v: B): Optional<B> {
    return new Optional(v);
  }

  public static empty<B>(): Optional<B> {
    return new Optional((null as unknown) as B);
  }

  private readonly v: A;

  constructor(v: A) {
    this.v = v;
  }

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
  public map<B>(fn: (a: A) => B): Optional<B> {
    return this.isEmpty() ? Optional.empty() : new Optional(fn(this.v));
  }

  /**
   * applies the async function to the inner value if it exists. Swaps what
   * would have been an inner Promise to the outside.
   * @param {(A) => Promise<B>} fn
   * @returns {Promise<Optional<B>>}
   */
  public pMap<B>(fn: (a: A) => Promise<B>): Promise<Optional<B>> {
    return this.isEmpty()
      ? Promise.resolve(Optional.empty())
      : fn(this.v).then(b => new Optional(b));
  }

  /**
   * applies the function to the inner value if it exists.
   * similar to `map` except the function should return an Optional and the final
   * result will be empty if the function returns an empty Optional.
   * @param {(A) => Optional<B>} fn
   * @returns {Optional<B>}
   */
  public flatMap<B>(fn: (a: A) => Optional<B>): Optional<B> {
    return this.isEmpty() ? Optional.empty() : fn(this.v);
  }

  /**
   * returns the inner value
   * @throws {Error} when trying to get a value of an empty Optional
   */
  public get(): A {
    if (this.isEmpty()) {
      throw new Error('called get on an empty Optional');
    }
    return this.v;
  }

  /**
   * returns the inner value if it exists, otherwise returns the passed in value
   * @param {A} d the default value to return if the Optional is empty
   */
  public getOrElse(d: A): A {
    return this.isEmpty() ? d : this.v;
  }

  /**
   * returns whether or not the Optional's inner value is equal to what is
   * passed in. Uses `===`
   * @param v
   */
  public contains(v: A): boolean {
    return this.v === v;
  }

  /**
   * returns true if this Optional contains `undefined` or `null`, false otherwise
   */
  public isEmpty(): boolean {
    return this.v === undefined || this.v === null;
  }
}
