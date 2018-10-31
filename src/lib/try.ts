import { Optional } from "./optional";

export abstract class Try<A> {

    public static of<B>(fn: () => B): Try<B | Error> {
        try {
            const value = fn();
            return new Success(value);
        } catch (error) {
            return new Failure(error);
        }
    }

    protected readonly value: A;

    constructor(v: A) {
        this.value = v;
    }

    public abstract get(): A

    public abstract isSuccess(): boolean

    public abstract isFailure(): boolean

    public toOption(): Optional<A> {
        return this.isSuccess() ? Optional.of(this.value) : Optional.empty();
    }

}

export class Failure extends Try<Error> {

    public get(): Error {
        throw this.value;
    }

    public isSuccess(): boolean {
        return false;
    }

    public isFailure(): boolean {
        return true;
    }

}

export class Success<A> extends Try<A> {

    public get(): A {
        return this.value;
    }

    public isSuccess(): boolean {
        return true;
    }

    public isFailure(): boolean {
        return false;
    }

}