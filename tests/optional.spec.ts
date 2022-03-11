import { Opt, Optional, Some } from "../src";

describe("isEmpty", () => {
    it("isEmpty() should return true for undefined", () => {
        const opt = Optional.of(undefined);
        expect(opt.isEmpty()).toBeTruthy();
    });

    it("isEmpty() should return true for null", () => {
        const opt = Optional.of(null);
        expect(opt.isEmpty()).toBeTruthy();
    });

    it("isEmpty() should return true for something mapped to undefined", () => {
        const opt = Optional.of({ a: undefined }).map((o) => o.a);
        expect(opt.isEmpty()).toBeTruthy();
    });

    it("static isEmpty() calls internal isEmpty", () => {
        const opt = Optional.of("foobar");
        jest.spyOn(opt, "isEmpty");
        expect(Optional.isEmpty(opt)).toEqual(false)
        expect(opt.isEmpty).toHaveBeenCalledTimes(1);
    });
});

describe("contains", () => {
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

    test("static contains returns a function", () => {
        const fn = Optional.contains("foobar");
        expect(typeof fn).toEqual("function");
        expect(fn(Optional.of("foobar"))).toEqual(true);
        expect(fn(Optional.of("blahblah"))).toEqual(false);
    });

    test("static contains will return the check", () => {
        const res1 = Optional.contains("foobar", Optional.of("foobar"));
        expect(res1).toEqual(true);

        const res2 = Optional.contains("foobar", Optional.of("blahblah"));
        expect(res2).toEqual(false);
    })
});

describe("getOrElse", () => {
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
});

describe("map", () => {
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
});

describe("pMap", () => {
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
});

describe("get", () => {
    test("get() should throw on empty", () => {
        const opt = Optional.empty();
        expect(() => opt.get()).toThrow();
    });

    test("get() should return inner value", () => {
        const opt = Optional.of("foobar");
        expect(opt.get()).toEqual("foobar");
    });
});

describe("exists", () => {
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
});

describe("new Some()", () => {
    it("constructing a Some with null throws", () => {
        const fn = () => new Some<string>((null as unknown) as string);
        expect(fn).toThrow();
    });
});

describe("getOrThrow", () => {
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
});

describe("getOrNull", () => {
    test("getOrNull() should return inner value", () => {
        const res = Optional.of("HELLO").getOrNull();
        expect(res).toEqual("HELLO");
    });

    test("getOrNull() should return null", () => {
        const res = Optional.empty<string>().getOrNull();
        expect(res).toEqual(null);
    });
});

describe("getOrUndefined", () => {
    test("getOrUndefined() should return inner value", () => {
        const res = Optional.of("HELLO").getOrUndefined();
        expect(res).toEqual("HELLO");
    });

    test("getOrUndefeind() should return undefined", () => {
        const res = Optional.empty<string>().getOrUndefined();
        expect(res).toEqual(undefined);
    });
});

describe("async", () => {
    it("transforms a Some<A> to an OptionalAsync<A>", async () => {
        const result = await Optional.of("Hello")
            .async()
            .map((str) => str + " World!")
            .promise();
        expect(result.isEmpty()).toBeFalsy();
        expect(result.contains("Hello World!")).toBeTruthy();
    });

    it("transforms a None<A> to an OptionalAsync<A>", async () => {
        const fn = jest.fn();
        const result = await Optional.empty<string>().async().map(fn).promise();
        expect(result.isEmpty()).toBeTruthy();
        expect(fn).not.toHaveBeenCalled();
    });
});

describe("ap", () => {
    it("returns none", () => {
        const oFn = Optional.of((v: number) => v + 1);
        const result = Optional.empty<number>().ap(oFn);
        expect(result.isEmpty()).toBeTruthy();
    });

    it("runs the inner fn", () => {
        const oFn = Optional.of((v: number) => v + 1);
        const result = Optional.of<number>(1088).ap(oFn);
        expect(result.isEmpty()).toBeFalsy();
        expect(result.get()).toEqual(1089);
    });
});

describe("case", () => {
    it("returns the some predicate", () => {
        const result = Optional.of("hello").case({
            some: (str) => Optional.of(str + " world"),
            none: () => Optional.of("foobar"),
        });
        expect(result.isEmpty()).toEqual(false);
        expect(result.get()).toEqual("hello world");
    });

    it("returns the none predicate", () => {
        const result = Optional.empty<string>().case({
            some: (str) => Optional.of(str + " world"),
            none: () => Optional.of("foobar"),
        });
        expect(result.isEmpty()).toEqual(false);
        expect(result.get()).toEqual("foobar");
    });
});

describe("chain", () => {
    it("Some.chain(Some) returns Some", () => {
        const result = Optional.of("hello").chain((str) => Optional.of(str + " world"));
        expect(result.isEmpty()).toBe(false);
        expect(result.get()).toEqual("hello world");
    });

    it("Some.chain(None) returns None", () => {
        const result = Optional.of("hello").chain(() => Optional.empty());
        expect(result.isEmpty()).toBe(true);
    });

    it("None.chain(Some) returns None", () => {
        const result = Optional.empty<string>().chain(() => Optional.of(" world"));
        expect(result.isEmpty()).toBe(true);
    });

    it("None.chain(None) returns None", () => {
        const result = Optional.empty<string>().chain(() => Optional.empty());
        expect(result.isEmpty()).toBe(true);
    });
});

describe("flatMap", () => {
    it("returns inner", () => {
        const opt = Optional.of({ a: "foobar" });
        const res = opt.flatMap((o) => Optional.of(o.a));
        expect(res.contains("foobar")).toBeTruthy();
    });

    it("returns empty", () => {
        const opt = Optional.of({ a: null });
        const res = opt.flatMap((o) => Optional.of(o.a));
        expect(res.isEmpty()).toBeTruthy();
    });

    it("works over empty", () => {
        const opt = Optional.of(null);
        const res = opt.flatMap((a) => Optional.of(a));
        expect(res.isEmpty()).toBeTruthy();
    });
});

describe("flatten", () => {
    it("filters out empty optionals", () => {
        const opts = [1, 2, undefined].map(Optional.of);
        const result = Optional.flatten(opts);
        expect(result).toEqual([1, 2]);
    });
    it("works on empty arrays", () => {
        const opts = [].map(Optional.of);
        const result = Optional.flatten(opts);
        expect(result).toEqual([]);
    });
    it("keeps non-empty values", () => {
        const opts = ["foo", "bar"].map(Optional.of);
        const result = Optional.flatten(opts);
        expect(result).toEqual(["foo", "bar"]);
    });
});

describe("mapAsync", () => {
    it("maps over a Some", async () => {
        const result = await Optional.of("hello")
            .mapAsync((str) => Promise.resolve(str + " world"))
            .promise();
        expect(result.isEmpty()).toBeFalsy();
        expect(result.get()).toEqual("hello world");
    });

    it("maps over a None", async () => {
        const result = await Optional.empty<string>()
            .mapAsync((str) => Promise.resolve(str + " world"))
            .promise();
        expect(result.isEmpty()).toBeTruthy();
    })
});

describe("all", () => {
    it("returns an array with all the values", () => {
        const result = Optional.all([
            Optional.of(1),
            Optional.of(2),
            Optional.of(3),
            Optional.of(4),
        ]);
        expect(result.get()).toEqual([1, 2, 3, 4]);
    });

    it("returns empty if one of them is empty", () => {
        const result = Optional.all([
            Optional.of(1),
            Optional.empty<number>(),
            Optional.of(3),
            Optional.of(4),
        ]);
        expect(result.isEmpty()).toEqual(true);
    });
});

describe("Opt", () => {
    it("is just an alias for Optional", () => {
        const opt = Opt.of("foobar");
        expect(opt.get()).toEqual("foobar");
        expect(opt.contains("foobar")).toBeTruthy();
        expect(opt.exists((s) => s === "foobar")).toBeTruthy();
    });
});

describe("toTry", () => {
    it("returns a success if not empty", () => {
        const error = new Error("expected");
        const result = Optional.of("foobar").toTry(error);
        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual("foobar");
    });

    it("returns a failure if not empty", () => {
        const error = new Error("expected");
        const result = Optional.of(undefined).toTry(error);
        expect(result.isFailure()).toEqual(true);
        expect(result.get).toThrow("expected");
    });
});

