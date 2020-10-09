import { OptionalAsync } from "./optional-async";

describe("OptionalAsync", () => {
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

    describe("all", () => {
        it("returns an object if everything is defined", async () => {
            const result = await OptionalAsync.all({
                foo: OptionalAsync.of("foo"),
                bar: OptionalAsync.of(123),
            }).promise();

            expect(result.isEmpty()).toBeFalsy();
            expect(result.get()).toEqual({ foo: "foo", bar: 123 });
        });
        it("returns an empty if everything one is empty", async () => {
            const result = await OptionalAsync.all({
                foo: OptionalAsync.of("foo"),
                bar: OptionalAsync.empty<number>(),
            }).promise();

            expect(result.isEmpty()).toBeTruthy();
            expect(result.get).toThrow();
        });
    });
});
