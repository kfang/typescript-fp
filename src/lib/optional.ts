export class Optional<A> {
  public static flatten(o: {
    readonly [k: string]: Optional<any>;
  }): { readonly [k: string]: any } {
    return Object.keys(o).reduce((result, key) => {
      return o[key].isEmpty() ? result : { ...result, key: o[key].get() };
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

  public map<B>(fn: (a: A) => B): Optional<B> {
    return this.isEmpty() ? Optional.empty() : new Optional(fn(this.v));
  }

  public pMap<B>(fn: (a: A) => Promise<B>): Promise<Optional<B>> {
    return this.isEmpty()
      ? Promise.resolve(Optional.empty())
      : fn(this.v).then(b => new Optional(b));
  }

  public flatMap<B>(fn: (a: A) => Optional<B>): Optional<B> {
    return this.isEmpty() ? Optional.empty() : fn(this.v);
  }

  public get(): A {
    if (this.isEmpty()) {
      throw new Error('called get on an empty Optional');
    }
    return this.v;
  }

  public getOrElse(d: A): A {
    return this.isEmpty() ? d : this.v;
  }

  public contains(v: A): boolean {
    return this.v === v;
  }

  public isEmpty(): boolean {
    return this.v === undefined || this.v === null;
  }
}
