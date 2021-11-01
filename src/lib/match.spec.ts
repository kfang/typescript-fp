import { Match } from "../index";

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
});