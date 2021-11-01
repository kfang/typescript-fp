import { OptionalAsync } from "./optional-async";

describe("OptionalAsync", () => {
    describe("ap", () => {
        it("applies the fn", async () => {
            const fn = OptionalAsync.of((n: number) => n + 1);
            const result = await OptionalAsync.of(128).ap(fn).promise();
            expect(result.isEmpty()).toEqual(false);
            expect(result.get()).toEqual(129);
        });

        it("does not apply the fn", async () => {
            const fn = OptionalAsync.of((n: number) => n + 1);
            const result = await OptionalAsync.empty<number>().ap(fn).promise();
            expect(result.isEmpty()).toEqual(true);
        });
    });

    describe("map", () => {
        it("runs the map function", async () => {
            const result = await OptionalAsync.of("Hello")
                .map((str) => str + " World!")
                .promise();
            expect(result.get()).toEqual("Hello World!");
        });

        it("does not run the map function", async () => {
            const fn = jest.fn();
            const result = await OptionalAsync.empty().map(fn).promise();
            expect(result.isEmpty()).toBeTruthy();
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe("flatMap", () => {
        it("runs the fn on inner optional", async () => {
            const result = await OptionalAsync.of("Hello")
                .flatMap((str) => OptionalAsync.of(str + " World!"))
                .promise();
            expect(result.isEmpty()).toBeFalsy();
            expect(result.get()).toEqual("Hello World!");
        });
        it("does not run the inner fn", async () => {
            const fn = jest.fn();
            const result = await OptionalAsync.empty().flatMap(fn).promise();
            expect(result.isEmpty()).toBeTruthy();
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe("mapAsync", () => {
        it("runs the fn on inner optional", async () => {
            const result = await OptionalAsync.of("Hello")
                .mapAsync((str) => Promise.resolve(str + " World!"))
                .promise();
            expect(result.isEmpty()).toBeFalsy();
            expect(result.get()).toEqual("Hello World!");
        });
        it("does not run the fn on inner optional", async () => {
            const fn = jest.fn();
            const result = await OptionalAsync.empty().mapAsync(fn).promise();
            expect(result.isEmpty()).toBeTruthy();
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe("getOrElse", () => {
        it("returns the value of inner optional", async () => {
            const result = await OptionalAsync.of("Hello").getOrElse("World!");
            expect(result).toEqual("Hello");
        });
        it("returns the default value", async () => {
            const result = await OptionalAsync.empty().getOrElse("World!");
            expect(result).toEqual("World!");
        });
    });

    describe("getOrNull", () => {
        it("returns the value of inner optional", async () => {
            const result = await OptionalAsync.of("Hello").getOrNull();
            expect(result).toEqual("Hello");
        });
        it("returns null", async () => {
            const result = await OptionalAsync.empty().getOrNull();
            expect(result).toEqual(null);
        });
    });

    describe("getOrUndefined", () => {
        it("returns the value of inner optional", async () => {
            const result = await OptionalAsync.of("Hello").getOrUndefined();
            expect(result).toEqual("Hello");
        });
        it("returns undefined", async () => {
            const result = await OptionalAsync.empty().getOrUndefined();
            expect(result).toEqual(undefined);
        });
    });

    describe("getOrThrow", () => {
        it("returns the value of inner optional", async () => {
            const result = await OptionalAsync.of("Hello").getOrThrow(new Error());
            expect(result).toEqual("Hello");
        });
        it("rejects the promise", async () => {
            const error = new Error("expected failure");
            const result = OptionalAsync.empty().getOrThrow(error);
            await expect(result).rejects.toThrow(error);
        });
    });

    describe("get", () => {
        it("returns the value of inner optional", async () => {
            const result = await OptionalAsync.of("Hello").get();
            expect(result).toEqual("Hello");
        });
        it("rejects the promise", async () => {
            const result = OptionalAsync.empty().get();
            await expect(result).rejects.toThrow();
        });
    });

    describe("contains", () => {
        it("calls contains on inner some and returns true", async () => {
            const result = await OptionalAsync.of("Hello").contains("Hello");
            expect(result).toBeTruthy();
        });
        it("calls contains on inner some and returns false", async () => {
            const result = await OptionalAsync.of("Hello").contains("World");
            expect(result).toBeFalsy();
        });
        it("calls contains on inner none and returns false", async () => {
            const result = await OptionalAsync.empty().contains("Hello");
            expect(result).toBeFalsy();
        });
    });

    describe("exists", () => {
        it("calls exists on inner some and returns true", async () => {
            const result = await OptionalAsync.of([1, 2, 3]).exists((arr) => arr.includes(2));
            expect(result).toBeTruthy();
        });
        it("calls exists on inner some and returns false", async () => {
            const result = await OptionalAsync.of([1, 2, 3]).exists((arr) => arr.includes(8));
            expect(result).toBeFalsy();
        });
        it("calls exists on inner none and returns false", async () => {
            const result = await OptionalAsync.empty<number[]>().exists((arr) => arr.includes(8));
            expect(result).toBeFalsy();
        });
    });

    describe("flatten", () => {
        it("filters out empty optionals", async () => {
            const opts = [1, 2, undefined].map(OptionalAsync.of);
            const result = await OptionalAsync.flatten(opts);
            expect(result).toEqual([1, 2]);
        });
        it("works on empty arrays", async () => {
            const opts = [].map(OptionalAsync.of);
            const result = await OptionalAsync.flatten(opts);
            expect(result).toEqual([]);
        });
        it("keeps non-empty values", async () => {
            const opts = ["foo", "bar"].map(OptionalAsync.of);
            const result = await OptionalAsync.flatten(opts);
            expect(result).toEqual(["foo", "bar"]);
        });
    });

    describe("case", () => {
        it("returns the some predicate", async () => {
            const result = await OptionalAsync.of("hello")
                .case({
                    some: (str) => OptionalAsync.of(str + " world"),
                    none: () => OptionalAsync.of("foobar"),
                })
                .promise();
            expect(result.isEmpty()).toEqual(false);
            expect(result.get()).toEqual("hello world");
        });
        it("returns the none predicate", async () => {
            const result = await OptionalAsync.empty<string>()
                .case({
                    some: (str) => OptionalAsync.of(str + " world"),
                    none: () => OptionalAsync.of("foobar"),
                })
                .promise();
            expect(result.isEmpty()).toEqual(false);
            expect(result.get()).toEqual("foobar");
        });
    });

    describe("all", () => {
        it("returns all values in an array", async () => {
            const result = await OptionalAsync.all([
                OptionalAsync.of(1),
                OptionalAsync.of(2),
                OptionalAsync.of(3),
                OptionalAsync.of(4),
            ]).promise();

            expect(result.get()).toEqual([1, 2, 3, 4]);
        });

        it("returns none if one in the array is empty", async () => {
            const result = await OptionalAsync.all([
                OptionalAsync.of(1),
                OptionalAsync.empty<number>(),
                OptionalAsync.of(3),
                OptionalAsync.of(4),
            ]).promise();

            expect(result.isEmpty()).toEqual(true);
        });
    });
});
