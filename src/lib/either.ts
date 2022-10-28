interface IEither<L1, R1> {
    case<T1>(predicates: {
        left: (value: L1) => T1,
        right: (value: R1) => T1,
    }): T1;
    flatMap<R2>(fn: (r: R1) => IEither<L1, R2>): IEither<L1, R2>;
    isLeft(): boolean;
    isRight(): boolean;
    map<R2>(fn: (r: R1) => R2): IEither<L1, R2>;
    mapLeft<L2>(fn: (r: L1) => L2): IEither<L2, R1>;
    mapRight<R2>(fn: (r: R1) => R2): IEither<L1, R2>;
}

class Right<L1, R1> implements IEither<L1, R1> {
    constructor(private readonly value: R1) {
        this.value = value;
    }

    public flatMap<R2>(fn: (r: R1) => IEither<L1, R2>): IEither<L1, R2> {
        return fn(this.value);
    }

    public isLeft(): boolean {
        return false
    }

    public isRight(): boolean {
        return true;
    }

    public map<R2>(fn: (r: R1) => R2): IEither<L1, R2> {
        return new Right<L1, R2>(fn(this.value));
    }

    public mapLeft<L2>(): IEither<L2, R1> {
        return this as unknown as IEither<L2, R1>;
    }

    public mapRight<R2>(fn: (r: R1) => R2): IEither<L1, R2> {
        return this.map(fn);
    }

    public case<T1>(predicates: { left: (value: L1) => T1; right: (value: R1) => T1 }): T1 {
        return predicates.right(this.value);
    }
}

class Left<L1, R1> implements IEither<L1, R1> {
    constructor(private readonly value: L1) {
    }

    public flatMap<R2>(): IEither<L1, R2> {
        return this as unknown as IEither<L1, R2>;
    }

    public isLeft(): boolean {
        return true;
    }

    public isRight(): boolean {
        return false;
    }

    public map<R2>(): IEither<L1, R2> {
        return this as unknown as IEither<L1, R2>;
    }

    public mapLeft<L2>(fn: (r: L1) => L2): IEither<L2, R1> {
        return new Left(fn(this.value));
    }

    public mapRight<R2>(): IEither<L1, R2> {
        return this as unknown as IEither<L1, R2>;
    }

    public case<T1>(predicates: { left: (value: L1) => T1; right: (value: R1) => T1 }): T1 {
        return predicates.left(this.value);
    }

}

export abstract class Either<L1, R1> implements IEither<L1, R1> {
    public static left<L1 = unknown, R1 = unknown>(value: L1): Either<L1, R1> {
        return new Left(value);
    }

    public static right<L1 = unknown, R1 = unknown>(value: R1): Either<L1, R1> {
        return new Right(value);
    }

    public static isLeft<L1, R1>(eit: Either<L1, R1>): boolean {
        return eit.isLeft();
    }

    public static isRight<L1, R1>(eit: Either<L1, R1>): boolean {
        return eit.isRight();
    }

    abstract flatMap<R2>(fn: (r: R1) => IEither<L1, R2>): IEither<L1, R2>;

    abstract isLeft(): boolean;

    abstract isRight(): boolean;

    abstract map<R2>(fn: (r: R1) => R2): IEither<L1, R2>;

    abstract mapLeft<L2>(fn: (r: L1) => L2): IEither<L2, R1>;

    abstract mapRight<R2>(fn: (r: R1) => R2): IEither<L1, R2>;

    abstract case<T1>(predicates: { left: (value: L1) => T1; right: (value: R1) => T1 }): T1;
}
