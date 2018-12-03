import {Optional} from "./optional";

export class OptionalP<T1> {

    private readonly value: Promise<Optional<T1>>;

    public static empty<T>(): OptionalP<T> {
        return new OptionalP(Promise.resolve(Optional.empty<T>()));
    }

    public static of<T>(value: Promise<Optional<T>>): OptionalP<T> {
        return new OptionalP(value);
    }

    public static ofP<T>(value: Optional<Promise<T>>): OptionalP<T> {
        return new OptionalP(value
            .map(p => p.then(Optional.of))
            .getOrElse(Promise.resolve(Optional.empty<T>())));
    }

    constructor(value: Promise<Optional<T1>>){
        this.value = value;
    }

    public get(): Promise<Optional<T1>> {
        return this.value;
    }

    public map<T2>(fn: (t: T1) => T2): OptionalP<T2> {
        const res = this.value.then((opt) => opt.map(fn));
        return new OptionalP(res);
    }

    public flatMap<T2>(fn: (t: T1) => Optional<T2>): OptionalP<T2> {
        const res = this.value.then((opt) => opt.flatMap(fn));
        return new OptionalP(res);
    }

}
