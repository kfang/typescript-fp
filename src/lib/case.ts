
export type Predicate<In> = (input: In) => boolean;

export class Switch<In, Out> {

    public static case<In, Out>(p: In, o: Out): Switch<In, Out> {
        return new Switch<In, Out>().case(p, o);
    }

    private readonly cases: { predicate: Predicate<In>, output: Out }[];

    private constructor() {
        this.cases = [];
    }

    public case(p: In, o: Out): this {
        const predicate = (i: In) => i === p;
        this.cases.push({predicate, output: o});
        return this;
    }

    public default(output: Out): (_: In) => Out {
        const fn = (input: In) => {
            for (const c of this.cases) {
                if (c.predicate(input)) {
                    return c.output;
                }
            }
            return output
        }
        return fn.bind(this);
    }
}
