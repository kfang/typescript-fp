
type Predicate<In> = In | ((i: In) => boolean);
type Evaluation<In, Out> = Out | ((i: In) => Out);

interface Case<In, Out> {
    predicate: (input: In) => boolean;
    evaluation: (input: In) => Out;
}

export class Match<In, Out> {

    public static case<I, O>(input: Predicate<I>, output: Evaluation<I, O>): Match<I, O> {
        return new Match<I, O>().case(input, output);
    }

    private readonly cases: Case<In, Out>[];

    private constructor() {
        this.cases = [];
    }

    public case(input: Predicate<In>, output: Evaluation<In, Out>): this {
        let predicate = (i: In) => i === input;
        if (typeof input === "function") {
            predicate = input as (i: In) => boolean;
        }

        let evaluation: (i: In) => Out = () => output as Out;
        if (typeof output === "function") {
            evaluation = output as (i: In) => Out;
        }

        this.cases.push({ predicate, evaluation });
        return this;
    }

    public default(value: Out): (input: In) => Out {
        return (input: In) => {
            for (const c of this.cases) {
                if (c.predicate(input)) {
                    return c.evaluation(input);
                }
            }
            return value;
        }
    }
}
