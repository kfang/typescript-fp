type Predicate<A> = (a: A) => boolean;
type Resolver<A, B> = (a: A) => B;

type Reduced<A, B> = A extends unknown ? B : A;

class Switch<I = unknown, O = unknown> {
    public static on<A>(input: A): Switch<A, unknown> {
        return new Switch<A, unknown>(input);
    }

    private readonly input: I;
    private readonly resolvers: [Predicate<I>, Resolver<any, any>][];

    private constructor(input: I) {
        this.input = input;
        this.resolvers = [];
    }

    public case<B extends I, C extends O>(predicate: Predicate<I>, resolver: Resolver<B, C>): Switch<I, C> {
        this.resolvers.push([predicate, resolver]);
        return this as Switch<I, C>;
    }
}

class Basic {
    public readonly name: string = "";
    public readonly foo: string = "";
}

class BadThing extends Basic {
    public readonly bar: number = 3;
}

class Blaa {
    public readonly name: string = "";
}

type NamedError = { name: string; }
function isError(spec: NamedError) {
    return (gen: NamedError): boolean => {
        return spec.name === gen.name;
    }
}

const x = Switch.on(new Basic())
    .case(isError(BadThing), (f: BadThing) => f.name)
    .case(isError(BadThing), (f: Blaa) => f.foo)