import test from "ava";
import { Try } from "./try";
import { TryAsync } from "./try-async";

test("map() runs fn on inner try", async (t) => {
    const tryA = "HELLO";
    const result = await TryAsync.of(Promise.resolve(tryA))
        .map((str) => str + " WORLD!!!")
        .promise();
    t.deepEqual(result.get(), "HELLO WORLD!!!");
});

test("map() leaves the inner failure", async (t) => {
    const error = new Error("Expected Failure");
    const result = await TryAsync.of(Promise.reject(error))
        .map((str) => str + " WORLD!!!")
        .promise();
    t.truthy(result.isFailure());
    t.throws(() => result.get(), null, error.message);
});

test("map() catches exceptions and converts them to failures", async (t) => {
    const error = new Error("Expected Failure");
    const tryA = Try.success("HELLO");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .map(() => {
            throw error;
        })
        .promise();
    t.truthy(result.isFailure());
    t.throws(() => result.get(), null, error.message);
});

test("flatMap() returns inner success", async (t) => {
    const tryA = "HELLO";
    const result = await TryAsync.of(Promise.resolve(tryA))
        .flatMap((str) => TryAsync.success(str + " WORLD!!!"))
        .promise();
    t.deepEqual(result.get(), "HELLO WORLD!!!");
});

test("flatMap() returns inner failure", async (t) => {
    const error = new Error("expected failure");
    const tryA = Try.success("HELLO");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .flatMap(() => TryAsync.failure(error))
        .promise();
    t.truthy(result.isFailure());
    t.throws(() => result.get(), null, error.message);
});

test("flatMap() does not run fn on inner failure", async (t) => {
    const error = new Error("expected failure");
    const result = await TryAsync.of(Promise.reject(error))
        .flatMap(() => TryAsync.success("foobar"))
        .promise();
    t.truthy(result.isFailure());
    t.throws(() => result.get(), null, error.message);
});

test("flatMap() returns failure on inner throw", async (t) => {
    const error = new Error("expected failure");
    const tryA = Try.success("foobar");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .flatMap(() => {
            throw error;
        })
        .promise();
    t.truthy(result.isFailure());
    t.throws(() => result.get(), null, error.message);
});

test("mapAsync() wraps resolved promise", async (t) => {
    const tryA = "hello";
    const result = await TryAsync.of(Promise.resolve(tryA))
        .mapAsync((str) => Promise.resolve(str + " world"))
        .promise();
    t.deepEqual(result.get(), "hello world");
});

test("mapAsync() wraps failed promise", async (t) => {
    const tryA = Try.success("hello");
    const result = await TryAsync.of(Promise.resolve(tryA))
        .mapAsync(() => Promise.reject("expected error"))
        .promise();
    t.deepEqual(result.isFailure(), true);
});

test("mapAsync() wraps failed fn", async (t) => {
    const tryA = Try.success("Hello");
    const res = await TryAsync.of(Promise.resolve(tryA))
        .mapAsync(() => {
            throw new Error("expected errro");
        })
        .promise();
    t.deepEqual(res.isFailure(), true);
});
