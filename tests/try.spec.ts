import { Try } from "../src";

test("isSuccess() should return true on non error", () => {
    const res = Try.of(() => "foobar");
    expect(res.isSuccess()).toBeTruthy();
    expect(Try.isSuccess(res)).toBeTruthy();
});

test("isSuccess() should return false on error", () => {
    const res = Try.of(() => {
        throw new Error();
    });
    expect(res.isSuccess()).toBeFalsy();
    expect(Try.isSuccess(res)).toBeFalsy();
});

test("isFailure() should return false on non error", () => {
    const res = Try.of(() => "foobar");
    expect(res.isFailure()).toBeFalsy();
    expect(Try.isFailure(res)).toBeFalsy();
});

test("isFailure() should return true on error", () => {
    const res = Try.of(() => {
        throw new Error();
    });
    expect(res.isFailure()).toBeTruthy();
    expect(Try.isFailure(res)).toBeTruthy();
});

test("get() should return the value on non error", () => {
    const res = Try.of(() => "foobar");
    expect(res.get()).toEqual("foobar");
});

test("get() should throw error on error", () => {
    const res = Try.of(() => {
        throw new Error();
    });
    expect(() => res.get()).toThrow();
});

test("getOrElse() should return the value on non error", () => {
    const res = Try.of(() => "foobar");
    expect(res.getOrElse("deadbeef")).toEqual("foobar");
});

test("getOrElse() should return the default value on error", () => {
    const res = Try.of<string>(() => {
        throw new Error();
    });
    expect(res.getOrElse("deadbeef")).toEqual("deadbeef");
});

test("toOptional() should return a nonempty Optional with the value", () => {
    const res = Try.of(() => "foobar").toOptional();
    expect(res.isEmpty()).toBeFalsy();
    expect(res.contains("foobar")).toBeTruthy();
    expect(res.get()).toEqual("foobar");
});

test("toOptional() should return an empty Optional", () => {
    const res = Try.of(() => {
        throw new Error();
    }).toOptional();
    expect(res.isEmpty()).toBeTruthy();
    expect(() => res.get()).toThrow();
});

test("pOf should return a Success on successful Promise", async () => {
    const res = await Try.pOf(() => Promise.resolve("foobar"));
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("foobar");
});

test("pOf should returna Failure on rejected Promise", async () => {
    const res = await Try.pOf(() => Promise.reject(new Error()));
    expect(res.isSuccess()).toBeFalsy();
    expect(() => res.get()).toThrow();
});

test("pOf should return Failure if function throws before Promise", async () => {
    const res = await Try.pOf(() => {
        throw new Error();
    });
    expect(res.isSuccess()).toBeFalsy();
    expect(() => res.get()).toThrow();
});

test("recover should run and return success if try failed", () => {
    const res = Try.of<string>(() => {
        throw new Error();
    }).recover(() => {
        return "foobar";
    });
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("foobar");
});

test("recover should not run if try succeeded", () => {
    const res = Try.of(() => "foobar").recover(() => {
        fail();
        return "deadbeef";
    });
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("foobar");
});

test("recoverWith() should not run if try succeeded", () => {
    const res = Try.of(() => "foobar").recoverWith(() => {
        fail();
        return Try.of(() => "deadbeef");
    });
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("foobar");
});

test("recoverWith() should run if try failed", () => {
    const res = Try.of<string>(() => {
        throw new Error("error");
    }).recoverWith((e) => {
        expect(e).toEqual(new Error("error"));
        return Try.of(() => "deadbeef");
    });
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("deadbeef");
});

test("map() should convert value on success", () => {
    const res = Try.of(() => ({ foo: "bar" })).map((o) => o.foo);
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("bar");
});

test("map() should not convert value on failure", () => {
    const res = Try.of<{ foo: unknown }>(() => {
        throw new Error();
    }).map((o) => o.foo);

    expect(res.isFailure()).toBeTruthy();
});

test("map() catches failed mapping function", () => {
    const res = Try.success("foobar").map(() => {
        throw new Error();
    });
    expect(res.isFailure()).toBeTruthy();
});

test("flatMap() should convert value on success", () => {
    const res = Try.of(() => ({ foo: "bar" })).flatMap((o) => Try.of(() => o.foo));
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("bar");
});

test("flatMap should return failure on failure", () => {
    const res = Try.of(() => ({ foo: "bar" })).flatMap(() =>
        Try.of(() => {
            throw new Error();
        }),
    );
    expect(res.isFailure()).toBeTruthy();
});

test("flatMap should return failure from a failure", () => {
    const res = Try.of(() => {
        throw new Error();
    }).flatMap(() => {
        fail("this shouldn't run");
        return Try.of(() => ({ foo: "bar" }));
    });

    expect(res.isFailure()).toBeTruthy();
});

test("flatMap catches failed mapping function", () => {
    const res = Try.success("fooba").flatMap(() => {
        throw new Error();
    });

    expect(res.isFailure()).toBeTruthy();
});

test("pMap() should return a wrapped failure on exception not in promise", async () => {
    const res = await Try.success("hello").pMap(() => {
        throw new Error();
    });
    expect(res.isFailure()).toBeTruthy();
});

test("pMap() should return a wrapped failure on failed promise", async () => {
    const res = await Try.success("hello").pMap(() => Promise.reject("FAILED"));
    expect(res.isFailure()).toBeTruthy();
});

test("pMap() returns a success on successful promise", async () => {
    const res = await Try.success("HELLO").pMap(() => Promise.resolve("WORLD"));
    expect(res.isSuccess()).toBeTruthy();
    expect(res.get()).toEqual("WORLD");
});

test("pMap() passes along the error", async () => {
    const res = await Try.failure(new Error()).pMap(() => Promise.resolve("foobar"));
    expect(res.isFailure()).toBeTruthy();
});

describe("flatten()", () => {
    it("keeps successful values, filters out errors", () => {
        const arr = [
            () => 1,
            () => 2,
            () => {
                throw new Error();
            },
            () => 3,
        ].map(Try.of);
        const res = Try.flatten(arr);
        expect(res).toEqual([1, 2, 3]);
    });
    it("filters out errors", () => {
        const arr = [
            () => {
                throw new Error();
            },
        ].map(Try.of);
        const res = Try.flatten(arr);
        expect(res).toEqual([]);
    });
    it("keeps successful Try", () => {
        const arr = [() => 1, () => 2, () => 3].map(Try.of);
        const res = Try.flatten(arr);
        expect(res).toEqual([1, 2, 3]);
    });
});

describe("ap", () => {
    it("passes through the failure", () => {
        const fn = Try.success((v: number) => v + 1);
        const res = Try.failure<number>(new Error()).ap(fn);
        expect(res.isFailure()).toBeTruthy();
    });

    it("runs the inner fn", () => {
        const fn = Try.success((v: number) => v + 1);
        const res = Try.success(907).ap(fn);
        expect(res.isSuccess()).toBeTruthy();
        expect(res.get()).toEqual(908);
    });
});

describe("case", () => {
    it("returns the success predicate", () => {
        const result = Try.success("hello").case({
            success: (str) => Try.of(() => str + " world"),
            failure: (error) => Try.failure<string>(error),
        });
        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual("hello world");
    });

    it("returns the failure predicate", () => {
        const result = Try.failure<string>(new Error("expected error")).case({
            success: (str) => Try.failure<string>(new Error(str)),
            failure: (error) => Try.success(error.message),
        });
        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual("expected error");
    });
});

describe("chain", () => {
    it("Success.chain(Success) returns Success", () => {
        const result = Try.success("hello")
            .chain((str) => Try.success(str + " world"))
            .get();
        expect(result).toEqual("hello world");
    });

    it("Success.chain(Failure) returns Failure", () => {
        const result = Try.success("hello").chain(() => Try.failure(new Error()));
        expect(result.isFailure()).toBeTruthy();
        expect(result.isSuccess()).toBeFalsy();
    });

    it("Failure.chain(Success) returns Success", () => {
        const result = Try.failure<string>(new Error()).chain((str) => Try.success(str + " world"));
        expect(result.isFailure()).toBeTruthy();
        expect(result.isSuccess()).toBeFalsy();
    });

    it("Failure.chain(Failure) returns Failure", () => {
        const result = Try.failure<string>(new Error()).chain(() => Try.failure(new Error()));
        expect(result.isFailure()).toBeTruthy();
        expect(result.isSuccess()).toBeFalsy();
    });
});

describe("mapAsync", () => {
    it("uses the fn to map over the inner value", async () => {
        const result = await Try.success("hello")
            .mapAsync((str) => Promise.resolve(str + " world"))
            .promise();
        expect(result.isFailure()).toEqual(false);
        expect(result.get()).toEqual("hello world");
    });

    it("catches a failed promise", async () => {
        const result = await Try.success("hello")
            .mapAsync(() => Promise.reject(new Error()))
            .promise();
        expect(result.isFailure()).toEqual(true);
    });

    it("does not call the fn if its a failure", async () => {
        const result = await Try.failure<string>(new Error())
            .mapAsync((str) => Promise.resolve(str + " world"))
            .promise();
        expect(result.isFailure()).toEqual(true);
    });
});

describe("all", () => {
    it("returns an array of successful values", () => {
        const result = Try.all([Try.success(1), Try.success(2), Try.success(3)]);

        expect(result.get()).toEqual([1, 2, 3]);
    });

    it("returns a failure if one is a failure", () => {
        const result = Try.all([Try.success(1), Try.failure<number>(new Error("expected failure")), Try.success(3)]);

        expect(result.get).toThrow("expected failure");
    });

    it("returns the first failure if multiple are a failures", () => {
        const result = Try.all([
            Try.success(1),
            Try.failure<number>(new Error("expected failure 1")),
            Try.failure<number>(new Error("expected failure 2")),
            Try.failure<number>(new Error("expected failure 3")),
        ]);

        expect(result.get).toThrow("expected failure 1");
    });
});

describe("void", () => {
    it("returns a success of undefined with void type", () => {
        const result = Try.void();
        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toBeUndefined();
    });

    it("converts a success to a void", () => {
        const result = Try.success("foobar").void();
        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toBeUndefined();
    });

    it("passes along the failure", () => {
        const result = Try.failure(new Error("expected failure")).void();
        expect(result.isFailure()).toEqual(true);
        expect(result.get).toThrow("expected failure");
    });
});
