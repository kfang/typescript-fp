export abstract class Functor<A> {
    abstract map<B>(fn: (a: A) => B): Functor<B>;
}

export abstract class Apply<A> implements Functor<A> {
    abstract ap<B>(b: Apply<(a: A) => B>): Apply<B>;
    abstract map<B>(fn: (a: A) => B): Apply<B>;
}

export abstract class Applicative<A> implements Apply<A> {
    static of<B>(b: B): Applicative<B> {
        throw new Error("unimplemented for value " + b);
    }
    abstract ap<B>(b: Applicative<(a: A) => B>): Applicative<B>;
    abstract map<B>(fn: (a: A) => B): Applicative<B>;
}

export abstract class Chain<A> implements Apply<A> {
    abstract ap<B>(b: Chain<(a: A) => B>): Chain<B>;
    abstract chain<B>(fn: (a: A) => Chain<B>): Chain<B>;
    abstract flatMap<B>(fn: (a: A) => Chain<B>): Chain<B>;
    abstract map<B>(fn: (a: A) => B): Chain<B>;
}

export abstract class Monad<A> implements Applicative<A>, Chain<A> {
    abstract ap<B>(b: Monad<(a: A) => B>): Monad<B>;
    abstract chain<B>(fn: (a: A) => Monad<B>): Monad<B>;
    abstract flatMap<B>(fn: (a: A) => Monad<B>): Monad<B>;
    abstract map<B>(fn: (a: A) => B): Monad<B>;
}
