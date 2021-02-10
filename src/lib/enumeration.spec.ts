import { EnumEntry, Enumeration } from "./enumeration";

describe("Enumeration", () => {
    class Color extends EnumEntry<string> {
        constructor(name: string, public readonly opposite: string) {
            super(name);
        }
    }

    const Colors = Enumeration.fromEntries({
        RED: new Color("red", "green"),
        GREEN: new Color("green", "red"),
        BLUE: new Color("blue", "orange"),
    });

    it("returns all the color names", () => {
        expect(Colors.names).toEqual(["RED", "GREEN", "BLUE"]);
    });

    it("returns all the color values", () => {
        expect(Colors.values).toEqual(["red", "green", "blue"]);
    });

    it("allows access directly to the color enum entries", () => {
        expect(Colors.RED.value).toEqual("red");
        expect(Colors.GREEN.value).toEqual("green");
        expect(Colors.BLUE.value).toEqual("blue");
    });

    it("returns the correct enum entry by name", () => {
        expect(Colors.withName("RED").contains(Colors.RED)).toBeTruthy();
        expect(Colors.withName("GREEN").contains(Colors.GREEN)).toBeTruthy();
        expect(Colors.withName("BLUE").contains(Colors.BLUE)).toBeTruthy();
    });

    it("returns an empty optional if there is no match on name", () => {
        expect(Colors.withName("FOOBAR").isEmpty()).toBeTruthy();
    });

    it("returns the correct enum entry by value", () => {
        expect(Colors.withValue("red").contains(Colors.RED)).toBeTruthy();
        expect(Colors.withValue("green").contains(Colors.GREEN)).toBeTruthy();
        expect(Colors.withValue("blue").contains(Colors.BLUE)).toBeTruthy();
    });

    it("returns an empty optional if there no match on value", () => {
        expect(Colors.withName("foobar").isEmpty()).toBeTruthy();
    });

    it("returns the correct opposite color", () => {
        expect(Colors.RED.opposite).toEqual("green");
        expect(Colors.GREEN.opposite).toEqual("red");
        expect(Colors.BLUE.opposite).toEqual("orange");
    });
});
