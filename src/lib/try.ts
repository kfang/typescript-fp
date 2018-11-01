import { Optional } from './optional';

export abstract class Try<A> {
  public static isSuccess<B>(t: Try<B>): boolean {
    return t.isSuccess();
  }

  public static isFailure<B>(t: Try<B>): boolean {
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
        .then(v => new Success(v))
        .catch(e => new Failure(e));
    } catch (e) {
      return Promise.resolve(new Failure(e));
    }
  }

  public abstract readonly isSuccess: () => boolean;
  public abstract readonly isFailure: () => boolean;
  public abstract readonly get: () => A;
  public abstract readonly getOrElse: (defaultValue: A) => A;
  public abstract readonly toOptional: () => Optional<A>;

  public abstract readonly recover: (fn: (e: Error) => A) => Try<A>;
  public abstract readonly recoverWith: (fn: (e: Error) => Try<A>) => Try<A>;
}

export class Failure<A> extends Try<A> {
  public readonly error: Error;

  constructor(e: Error) {
    super();
    this.error = e;
  }

  public readonly isSuccess = () => false;
  public readonly isFailure = () => true;
  public readonly get = () => {
    throw this.error;
  };
  public readonly getOrElse = (defaultValue: A) => defaultValue;
  public readonly toOptional: () => Optional<A> = () => Optional.empty();
  public readonly recover = (fn: (e: Error) => A) =>
    new Success(fn(this.error));
  public readonly recoverWith = (fn: (e: Error) => Try<A>) => fn(this.error);
}

export class Success<A> extends Try<A> {
  public readonly value: A;

  constructor(v: A) {
    super();
    this.value = v;
  }

  public readonly isSuccess = () => true;
  public readonly isFailure = () => false;
  public readonly get = () => this.value;
  public readonly getOrElse = () => this.value;
  public readonly toOptional = () => Optional.of(this.value);
  public readonly recover = () => this;
  public readonly recoverWith = () => this;
}
