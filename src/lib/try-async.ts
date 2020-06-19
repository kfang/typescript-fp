import { Try } from './try';

export class TryAsync<A> {
  public static of<B>(value: Promise<Try<B>>): TryAsync<B> {
    return new TryAsync<B>(value);
  }

  private readonly value: Promise<Try<A>>;

  private constructor(value: Promise<Try<A>>) {
    this.value = value;
  }

  public map<B>(fn: (value: A) => B): TryAsync<B> {
    const pTryB = this.value
      .then((tryA) => tryA.map(fn))
      .catch((error) => Try.failure<B>(error));
    return new TryAsync<B>(pTryB);
  }

  public flatMap<B>(fn: (value: A) => Try<B>): TryAsync<B> {
    const pTryB = this.value
      .then((tryA) => tryA.flatMap(fn))
      .catch((error) => Try.failure<B>(error));
    return new TryAsync<B>(pTryB);
  }

  public mapAsync<B>(fn: (value: A) => Promise<B>): TryAsync<B> {
    const pTryB = this.value
      .then((tryA) => tryA.pMap(fn))
      .catch((error) => Try.failure<B>(error));
    return new TryAsync<B>(pTryB);
  }

  public flatMapAsync<B>(fn: (value: A) => TryAsync<B>): TryAsync<B> {
    const pTryB = this.value
      .then((tryA) => {
        if (tryA.isFailure()) {
          return Try.failure<B>(tryA.error);
        } else {
          return fn(tryA.get()).promise();
        }
      })
      .catch((error) => Try.failure<B>(error));
    return new TryAsync<B>(pTryB);
  }

  public promise(): Promise<Try<A>> {
    return this.value;
  }
}
