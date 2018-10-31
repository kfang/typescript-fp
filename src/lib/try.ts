import { Optional } from './optional';

export abstract class Try<A> {
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

  protected readonly value: A;

  constructor(v: A) {
    this.value = v;
  }

  public abstract get(): A;

  public abstract getOrElse(defaultValue: A): A;

  public abstract isSuccess(): boolean;

  public abstract isFailure(): boolean;

  public abstract toOption(): Optional<A>;
}

export class Failure<A> extends Try<A> {
  public get(): A {
    throw this.value;
  }
  public getOrElse(defaultValue: A): A {
    return defaultValue;
  }

  public isSuccess(): boolean {
    return false;
  }

  public isFailure(): boolean {
    return true;
  }

  public toOption(): Optional<A> {
    return Optional.of(this.value);
  }
}

export class Success<A> extends Try<A> {
  public get(): A {
    return this.value;
  }

  public getOrElse(): A {
    return this.value;
  }

  public isSuccess(): boolean {
    return true;
  }

  public isFailure(): boolean {
    return false;
  }

  public toOption(): Optional<A> {
    return Optional.empty();
  }
}
