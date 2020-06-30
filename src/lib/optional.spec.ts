import { Optional, Some } from "./optional";

test("isEmpty() should return true for undefined", () => {
    const opt = Optional.of(undefined);
    expect(opt.isEmpty()).toBeTruthy();
});

test("isEmpty() should return true for null", () => {
    const opt = Optional.of(null);
    expect(opt.isEmpty()).toBeTruthy();
});

test("isEmpty() should return true for something mapped to undefined", () => {
    const opt = Optional.of({ a: undefined }).map((o) => o.a);
    expect(opt.isEmpty()).toBeTruthy();
});

test("contains() should return true if it contains foobar", () => {
    const opt = Optional.of("foobar");
    expect(opt.contains("foobar")).toBeTruthy();
});

test("contains() should return false if its the wrong value", () => {
    const opt = Optional.of("foobar");
    expect(opt.contains("deadbeef")).toBeFalsy();
});

test("contains() should return false for a none", () => {
    const opt = Optional.empty<string>();
    expect(opt.contains("foobar")).toBeFalsy();
});

test("getOrElse() should return inner value if nonempty", () => {
    const opt = Optional.of("foobar");
    const res = opt.getOrElse("deadbeef");
    expect(res).toEqual("foobar");
});

test("getOrElse() should return default value if empty", () => {
    const opt = Optional.empty();
    const res = opt.getOrElse("deadbeef");
    expect(res).toEqual("deadbeef");
});

test("map() should return the inner value", () => {
    const opt = Optional.of({ a: { b: "foobar" } });
    const res = opt.map((o) => o.a).map((o) => o.b);
    expect(res.contains("foobar")).toBeTruthy();
});

test("map() should be empty if null", () => {
    const opt = Optional.of({ a: null });
    const res = opt.map((o) => o.a);
    expect(res.isEmpty()).toBeTruthy();
});

test("map() should map over empty", () => {
    const opt = Optional.of(null);
    const res = opt.map((o) => o);
    expect(res.isEmpty()).toBeTruthy();
});

test("pMap() should wrap a nonempty promise", async () => {
    const opt = Optional.of("foobar");
    const res = await opt.pMap((s) => Promise.resolve(s));
    expect(res.contains("foobar")).toBeTruthy();
});

test("pMap() should wrap an empty", async () => {
    const opt = Optional.empty();
    const res = await opt.pMap((s) => Promise.resolve(s));
    expect(res.isEmpty()).toBeTruthy();
});

test("get() should throw on empty", () => {
    const opt = Optional.empty();
    expect(() => opt.get()).toThrow();
});

test("get() should return inner value", () => {
    const opt = Optional.of("foobar");
    expect(opt.get()).toEqual("foobar");
});

test("flatMap() should return inner", () => {
    const opt = Optional.of({ a: "foobar" });
    const res = opt.flatMap((o) => Optional.of(o.a));
    expect(res.contains("foobar")).toBeTruthy();
});

test("flatMap() should return empty", () => {
    const opt = Optional.of({ a: null });
    const res = opt.flatMap((o) => Optional.of(o.a));
    expect(res.isEmpty()).toBeTruthy();
});

test("flatMap() should work over empty", () => {
    const opt = Optional.of(null);
    const res = opt.flatMap((a) => Optional.of(a));
    expect(res.isEmpty()).toBeTruthy();
});

test("exists() should return false on a None", () => {
    const res = Optional.empty().exists(() => true);
    expect(res).toBeFalsy();
});

test("exists() should return true if the function passed returns true", () => {
    const res = Optional.of("foobar").exists((s) => s === "foobar");
    expect(res).toEqual(true);
});

test("exists() should return false if the function passed returns false", () => {
    const res = Optional.of("foobar").exists((s) => s === "hello world");
    expect(res).toEqual(false);
});

test("constructing a Some with null throws", () => {
    const fn = () => new Some<string>((null as unknown) as string);
    expect(fn).toThrow();
});

test("should return hello world", () => {
    const e = new Error();
    const v: string = Optional.of("hello world").getOrThrow(e);
    expect(v).toEqual("hello world");
});

test("should throw an error", () => {
    const e = new Error();
    const o = Optional.empty<string>();
    expect(() => o.getOrThrow(e)).toThrow();
});

test("getOrNull() should return inner value", () => {
    const res = Optional.of("HELLO").getOrNull();
    expect(res).toEqual("HELLO");
});

test("getOrNull() should return null", () => {
    const res = Optional.empty<string>().getOrNull();
    expect(res).toEqual(null);
});

test("getOrUndefined() should return inner value", () => {
    const res = Optional.of("HELLO").getOrUndefined();
    expect(res).toEqual("HELLO");
});

test("getOrUndefeind() should return undefined", () => {
    const res = Optional.empty<string>().getOrUndefined();
    expect(res).toEqual(undefined);
});

describe("async", () => {

    it("transforms a Some<A> to an OptionalAsync<A>", async () => {
        const result = await Optional.of("Hello").async()
            .map((str) => str + " World!")
            .promise();
        expect(result.isEmpty()).toBeFalsy();
        expect(result.contains("Hello World!")).toBeTruthy();
    })

    it("transforms a None<A> to an OptionalAsync<A>", async () => {
        const fn = jest.fn();
        const result = await Optional.empty<string>().async()
            .map(fn)
            .promise();
        expect(result.isEmpty()).toBeTruthy();
        expect(fn).not.toHaveBeenCalled();
    });

})