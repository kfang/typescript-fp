import { Match } from "../src";

describe("Match", () => {
    it("matches on a constant", () => {
        const m = Match
            .case("hello", "world")
            .default("default");
        expect(m("hello")).toEqual("world");
    });

    it("matches using a function", () => {
        const m = Match
            .case((i) => i === "hello", "world")
            .default("default");
        expect(m("hello")).toEqual("world");
    });

    it("evaluates using a function", () => {
        const m = Match
            .case("hello", (input) => input + " world")
            .default("default");
        expect(m("hello")).toEqual("hello world");
    });

    it("returns the default", () => {
        const m = Match
            .case("hello", (input) => input + " world")
            .default("default");
        expect(m("foobar")).toEqual("default");
    });

    it("matches the first statement", () => {
        const t1 = jest.fn();
        const f1 = jest.fn();
        const t2 = jest.fn();
        const f2= jest.fn();
        const m = Match
            .case("hello", "1")
            .case(t1, f1)
            .case(t2, f2)
            .default("foobar");
        expect(m("hello")).toEqual("1");
        expect(t1).not.toHaveBeenCalled();
        expect(f1).not.toHaveBeenCalled();
        expect(t2).not.toHaveBeenCalled();
        expect(f2).not.toHaveBeenCalled();
    })
});