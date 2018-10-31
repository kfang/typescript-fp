import { Optional } from './optional';

export abstract class Try<A> {

  public static isSuccess<B>(t: Try<B>): boolean {
    return t.isSuccess;
  }

  public static isFailure<B>(t: Try<B>): boolean {
    return t.isFailure;
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

  public abstract readonly isSuccess: boolean;
  public abstract readonly isFailure: boolean;
  public abstract readonly get: () => A;
  public abstract readonly getOrElse: (defaultValue: A) => A;
  public abstract readonly toOption: () => Optional<A>;

  protected readonly value: A;

  constructor(v: A) {
    this.value = v;
  }
}

export class Failure<A> extends Try<A> {
  public readonly isSuccess = false;
  public readonly isFailure = true;
  public readonly get = () => { throw this.value }
  public readonly getOrElse = (defaultValue: A) => defaultValue;
  public readonly toOption: () => Optional<A> = () => Optional.empty();
}

export class Success<A> extends Try<A> {
  public readonly isSuccess = true;
  public readonly isFailure = false;
  public readonly get = () => this.value;
  public readonly getOrElse = () => this.value;
  public readonly toOption = () => Optional.of(this.value);
}
