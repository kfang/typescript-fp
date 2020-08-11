class Match<I, O> {
    public static on<A>(input: A): Match<A, unknown> {
        return new Match<A, unknown>(input);
    }

    private readonly input: I;
    private readonly cases: Array<{ predicate: (input: I) => boolean; resolver: (input: any) => O }>;

    private constructor(input: I) {
        this.input = input;
        this.cases = [];
    }

    public case<A extends I, B extends O, Out extends B & O>(
        predicate: (input: I) => boolean,
        resolver: (input: A) => B,
    ): Match<I, Out> {
        this.cases.push({ predicate, resolver });
        return (this as unknown) as Match<I, Out>;
    }

    public default(defaultValue: O): O {
        for (const c of this.cases) {
            if (c.predicate(this.input)) {
                return c.resolver(this.input);
            }
        }
        return defaultValue;
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

type NamedError = { name: string };
function isError(spec: NamedError) {
    return (gen: NamedError): boolean => {
        return spec.name === gen.name;
    };
}

type R = BadThing extends Basic ? true : false;

const x = Match.on(new Basic())
    .case(isError(BadThing), (f: BadThing) => f.name)
    .case(isError(Blaa), (f: Blaa) => f.name)
    .default("kfjl");
