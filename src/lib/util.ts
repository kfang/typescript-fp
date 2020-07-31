import { Try } from "./try";

class Blah<R extends Record<string, unknown> = {}>{

    private operations: {key: string, fn: (a: any) => Try<any>}[] = [];

    public fold<A, K extends string, O extends Record<K, A>>(k: K, fn: (a: R) => Try<A>): Blah<R & O> {
        this.operations.push({ key: k, fn });
        return this as Blah<R & O>;
    }

    public yield(): Try<R> {
        return this.operations.reduce((prevTry: Try<Record<string, unknown>>, op) => {
            return prevTry.flatMap((res) => {
                return op.fn(res).map((v) => {
                    res[op.key] = v;
                    return res;
                });
            })
        }, Try.success({})) as Try<R>;
    }

}

const x = new Blah()
    .fold("foo", () => Try.success("bar"))
    .fold("next", () => Try.success(12840))
    .fold("generated", (o) => Try.success(o.next))
    .fold("ff", (o) => Try.failure(new Error(o.foo)))
    .yield();

    console.log(x.get());

