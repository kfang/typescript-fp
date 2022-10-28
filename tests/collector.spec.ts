import { Collector, Try, TryAsync } from "../src";

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

    it("defaults to an empty container", async () => {
        const getApple = () => TryAsync.success("apple");
        const getBanana = () => TryAsync.success("banana");
        const getPear = () => TryAsync.success("pear");

        const result = await Collector.forTryAsync()
            .fold("apple", getApple)
            .fold("banana", getBanana)
            .fold("pear", getPear)
            .yield()
            .promise();

        expect(result.get()).toEqual({
            apple: "apple",
            banana: "banana",
            pear: "pear",
        });
    });

    it("allows interfaces to be passed in", async () => {
        interface FooBar {
            apple: string;
            pear: number;
            banana: boolean;
        }
        const foobar: FooBar = { apple: "apple", banana: false, pear: 1234 };
        const result = await Collector.forTryAsync(foobar)
            .fold("zig", () => TryAsync.success("zag"))
            .yield()
            .promise();
        expect(result.get()).toEqual({
            apple: "apple",
            banana: false,
            pear: 1234,
            zig: "zag",
        });
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

    it("defaults to an empty container", () => {
        const getApple = () => Try.success("apple");
        const getBanana = () => Try.success("banana");
        const getPear = () => Try.success("pear");

        const result = Collector.forTry()
            .fold("apple", getApple)
            .fold("banana", getBanana)
            .fold("pear", getPear)
            .yield();

        expect(result.get()).toEqual({
            apple: "apple",
            banana: "banana",
            pear: "pear",
        });
    });

    it("allows interfaces to be passed in", () => {
        interface FooBar {
            apple: string;
            pear: number;
            banana: boolean;
        }
        const foobar: FooBar = { apple: "apple", banana: false, pear: 1234 };
        const result = Collector.forTry(foobar)
            .fold("zig", () => Try.success("zag"))
            .yield();
        expect(result.get()).toEqual({
            apple: "apple",
            banana: false,
            pear: 1234,
            zig: "zag",
        });
    });
});
