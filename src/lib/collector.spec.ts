import { Collector } from "./collector";
import { TryAsync } from "./try-async";
import { Try } from "./try";

describe("TryAsyncCollector", () => {
    it("collects items together in a Record", async () => {
        const result = await Collector.forTryAsync({ input: "hello" })
            .fold("output", (o) => TryAsync.success(o.input + " world"))
            .fold("len", (o) => TryAsync.success(o.output.length))
            .yield()
            .promise();

        const records = result.get();
        expect(records).toEqual({
            input: "hello",
            output: "hello world",
            len: 11,
        });
    });

    it("stops on failures along the way", async () => {
        const error = new Error("expected failure");
        const foobar = jest.fn(() => TryAsync.success("foobar"));
        const output = jest.fn((o) => TryAsync.success(o.input + " world"));

        const result = await Collector.forTryAsync({ input: "hello" })
            .fold("output", output)
            .fold("len", () => TryAsync.failure(error))
            .fold("foobar", foobar)
            .yield()
            .promise();

        expect(result.get).toThrow(error);
        expect(output).toHaveBeenCalledTimes(1);
        expect(output).toHaveBeenCalledWith({ input: "hello" });
        expect(foobar).not.toHaveBeenCalled();
    });
});

describe("TryCollector", () => {
    it("collects items together in a Record", () => {
        const result = Collector.forTry({ input: "hello" })
            .fold("output", (o) => Try.success(o.input + " world"))
            .fold("len", (o) => Try.success(o.output.length))
            .yield();

        const records = result.get();
        expect(records).toEqual({
            input: "hello",
            output: "hello world",
            len: 11,
        });
    });

    it("stops on failures along the way", () => {
        const error = new Error("expected failure");
        const foobar = jest.fn(() => Try.success("foobar"));
        const output = jest.fn((o) => Try.success(o.input + " world"));

        const result = Collector.forTry({ input: "hello" })
            .fold("output", output)
            .fold("len", () => Try.failure(error))
            .fold("foobar", foobar)
            .yield();

        expect(result.get).toThrow(error);
        expect(output).toHaveBeenCalledTimes(1);
        expect(output).toHaveBeenCalledWith({ input: "hello" });
        expect(foobar).not.toHaveBeenCalled();
    });
});