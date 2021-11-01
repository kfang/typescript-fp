
type Predicate<In> = In | ((i: In) => boolean);
type Evaluation<In, Out> = Out | ((i: In) => Out);

interface Case<In, Out> {
    predicate: (input: In) => boolean;
    evaluation: (input: In) => Out;
}

/**
 * Functional Match/Case Statement
 *
 * Idiomatically construct a switch/case statement without the use of unsafe reassignments when trying to return
 * a value.
 *
 * Typically, when using a switch/case, you need to do something like:
 * ```typescript
 * let result;
 * switch (value) {
 *   case 1:
 *     result = "a";
 *     break;
 *   case 2:
 *     result = "b";
 *     break;
 *   default:
 *     result = c;
 *     break;
 * }
 *
 * // do something with 'result'
 * ```
 * However, this approach can have several issues:
 * 1. a mutating variable that defaults to null;
 * 2. missing `break` statements leading to cascades down the switch statement
 * 3. missing `default` statement leading to the variable staying null.
 * 4. can only test on constants
 *
 * Using Match, we can improve:
 * ```typescript
 * import { Match } from "@kfang/typescript-fp"
 *
 * const isEqualToTwo = (i) => i === 2;
 *
 * const matchFn = Match
 *   .case(1, "a")
 *   .case(isEqualToTwo, "b")
 *   .default("c")
 *
 * const result = matchFn(value);
 * ```
 * The upsides:
 * 1. no mutating variables
 * 2. no need for `break` statements
 * 3. the `default` is enforced
 * 4. you can pass functions to match agains
 * 5. typed inputs and outputs to the function (if you're using typescript)
 * 6. reusable matching function
 *
 */
export class Match<In, Out> {

    /**
     * Creates a new instance of a `Match`.
     * @param {Predicate} input
     * @param {Evaluation} output
     */
    public static case<I, O>(input: Predicate<I>, output: Evaluation<I, O>): Match<I, O> {
        return new Match<I, O>().case(input, output);
    }

    private readonly cases: Case<In, Out>[];

    private constructor() {
        this.cases = [];
    }

    /**
     * Adds a new predicate onto this Match instance. Predicates are evaluated in the order they
     * are registered using calls to `case`.
     * @param {Predicate} input
     * @param {Evaluation} output
     */
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

    /**
     * Assigns the default value to the Match function if none of the predicates match. Calling `default`
     * returns the function that uses this match instance.
     * @param value
     */
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
