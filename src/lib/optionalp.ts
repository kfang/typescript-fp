import { Optional } from './optional';

export class OptionalP<T1> {
  public static empty<T>(): OptionalP<T> {
    return new OptionalP(Promise.resolve(Optional.empty<T>()));
  }

  public static of<T>(value: Promise<Optional<T>>): OptionalP<T> {
    return new OptionalP(value);
  }

  public static ofP<T>(value: Optional<Promise<T>>): OptionalP<T> {
    return new OptionalP(
      value
        .map((p) => p.then(Optional.of))
        .getOrElse(Promise.resolve(Optional.empty<T>()))
    );
  }
  private readonly value: Promise<Optional<T1>>;

  constructor(value: Promise<Optional<T1>>) {
    this.value = value;
  }

  public get(): Promise<Optional<T1>> {
    return this.value;
  }

  public map<T2>(fn: (t: T1) => T2): OptionalP<T2> {
    const res = this.value.then((opt) => opt.map(fn));
    return new OptionalP(res);
  }

  public pMap<T2>(fn: (t: T1) => Promise<T2>): OptionalP<T2> {
    const res: Promise<Optional<T2>> = this.value
      .then((opt) => opt.map(fn))
      .then((optP) => OptionalP.ofP(optP).get());
    return OptionalP.of(res);
  }

  public flatMap<T2>(fn: (t: T1) => Optional<T2>): OptionalP<T2> {
    const res = this.value.then((opt) => opt.flatMap(fn));
    return new OptionalP(res);
  }
}
