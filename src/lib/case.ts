import {Optional} from "./optional";

export type Predicate<In> = (input: In) => boolean;

export class Switch<In, Out> {

    public static case<In, Out>(p: In, o: Out): Switch<In, Out> {
        return new Switch<In, Out>().case(p, o);
    }

    public static match<In, Out>(p: Predicate<In>, o: Out): Switch<In, Out> {
        return new Switch<In, Out>().match(p, o);
    }

    private readonly _cases: {
        predicate: Predicate<In>,
        output: Out,
    }[];

    private _default: Optional<Out>;

    private constructor() {
        this._cases = [];
        this._default = Optional.empty();
    }

    public case(p: In, o: Out): this {
        const predicate = (i: In) => i === p;
        this._cases.push({predicate, output: o});
        return this;
    }

    public match(p: Predicate<In>, o: Out): this {
        this._cases.push({predicate: p, output: o});
        return this;
    }

    public default(d: Out): this {
        this._default = Optional.of(d);
        return this;
    }

    public eval(input: In): Optional<Out> {
        for (const c of this._cases) {
            if (c.predicate(input)) {
                return Optional.of(c.output);
            }
        }
        return this._default;
    }
}
