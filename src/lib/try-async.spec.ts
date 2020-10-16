import { Try } from "./try";
import { TryAsync } from "./try-async";

test("map() runs fn on inner try", async () => {
    const tryA = "HELLO";
    const result = await TryAsync.of(Promise.resolve(tryA))
        .map((str) => str + " WORLD!!!")
        .promise();
    expect(result.get()).toEqual("HELLO WORLD!!!");
});

test("map() leaves the inner failure", async () => {
    const error = new Error("Expected Failure");
    const result = await TryAsync.of(Promise.reject(error))
        .map((str) => str + " WORLD!!!")
        .promise();
    expect(result.isFailure()).toBeTruthy();
    expect(() => result.get()).toThrow(error);
});

test("map() catches exceptions and converts them to failures", async () => {
    const error = new Error("Expected Failure");
    const tryA = Try.success("HELLO");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .map(() => {
            throw error;
        })
        .promise();
    expect(result.isFailure()).toBeTruthy();
    expect(() => result.get()).toThrow(error);
});

test("flatMap() returns inner success", async () => {
    const tryA = "HELLO";
    const result = await TryAsync.of(Promise.resolve(tryA))
        .flatMap((str) => TryAsync.success(str + " WORLD!!!"))
        .promise();
    expect(result.get()).toEqual("HELLO WORLD!!!");
});

test("flatMap() returns inner failure", async () => {
    const error = new Error("expected failure");
    const tryA = Try.success("HELLO");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .flatMap(() => TryAsync.failure(error))
        .promise();
    expect(result.isFailure()).toBeTruthy();
    expect(() => result.get()).toThrow(error);
});

test("flatMap() does not run fn on inner failure", async () => {
    const error = new Error("expected failure");
    const result = await TryAsync.of(Promise.reject(error))
        .flatMap(() => TryAsync.success("foobar"))
        .promise();
    expect(result.isFailure()).toBeTruthy();
    expect(() => result.get()).toThrow(error);
});

test("flatMap() returns failure on inner throw", async () => {
    const error = new Error("expected failure");
    const tryA = Try.success("foobar");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .flatMap(() => {
            throw error;
        })
        .promise();
    expect(result.isFailure()).toBeTruthy();
    expect(() => result.get()).toThrow(error);
});

test("mapAsync() wraps resolved promise", async () => {
    const tryA = "hello";
    const result = await TryAsync.of(Promise.resolve(tryA))
        .mapAsync((str) => Promise.resolve(str + " world"))
        .promise();
    expect(result.get()).toEqual("hello world");
});

test("mapAsync() wraps failed promise", async () => {
    const tryA = Try.success("hello");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .mapAsync(() => Promise.reject("expected error"))
        .promise();
    expect(result.isFailure()).toBeTruthy();
});

test("mapAsync() wraps failed fn", async () => {
    const tryA = Try.success("Hello");
    const res = await TryAsync.of(Promise.resolve(tryA))
        .mapAsync(() => {
            throw new Error("expected errro");
        })
        .promise();
    expect(res.isFailure()).toBeTruthy();
});

describe("recover", () => {
    it("recovers from a failure", async () => {
        const error = new Error("foobar");
        const tryA = Try.failure<string>(error);
        const fn = jest.fn().mockImplementation((e) => e.message);

        const result = await tryA.async().recover(fn).promise();

        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual("foobar");
        expect(fn).toHaveBeenCalledWith(error);
    });
});

describe("recoverWith", () => {
    it("recovers from a failure", async () => {
        const error = new Error("foobar");
        const tryA = Try.failure<string>(error);
        const fn = jest.fn().mockImplementation((e) => TryAsync.success(e.message));

        const result = await tryA.async().recoverWith(fn).promise();

        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual("foobar");
        expect(fn).toHaveBeenCalledWith(error);
    });

    it("passes on a success", async () => {
        const tryA = Try.success("hello");
        const fn = jest.fn().mockImplementation((e) => TryAsync.success(e.message));

        const result = await tryA.async().recoverWith(fn).promise();

        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual("hello");
        expect(fn).not.toHaveBeenCalled();
    });
});

describe("flatten", () => {
    it("keeps successful values, filters out errors", async () => {
        const arr = [Promise.resolve(1), Promise.resolve(2), Promise.reject("foobar"), Promise.resolve(4)].map(
            TryAsync.of,
        );
        const res = await TryAsync.flatten(arr);
        expect(res).toEqual([1, 2, 4]);
    });
    it("filters out errors", async () => {
        const arr = [Promise.reject("foobar")].map(TryAsync.of);
        const res = await TryAsync.flatten(arr);
        expect(res).toEqual([]);
    });
    it("keeps successful Try", async () => {
        const arr = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)].map(TryAsync.of);
        const res = await TryAsync.flatten(arr);
        expect(res).toEqual([1, 2, 3]);
    });
});

describe("ap", () => {
    it("applies the fn on success", async () => {
        const fn = TryAsync.of((v: number) => v + 1);
        const result = await TryAsync.success(123).ap(fn).promise();
        expect(result.isSuccess()).toEqual(true);
        expect(result.get()).toEqual(124);
    });

    it("passes through the error", async () => {
        const fn = TryAsync.of((v: number) => v + 1);
        const err = new Error("expected error");
        const result = await TryAsync.failure<number>(err).ap(fn).promise();
        expect(result.isSuccess()).toEqual(false);
        expect(result.isFailure()).toEqual(true);
        expect(result.get).toThrow(err);
    });
});
