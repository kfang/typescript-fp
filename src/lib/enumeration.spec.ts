import { EnumEntry } from "../index";

class Color extends EnumEntry<string> {
    public static red = "RED";
    public static blue = "BLUE";

    public static RED = new Color("red", "green");
    public static BLUE = new Color("blue", "orange");
    public static YELLOW = new Color("yellow", "purple");

    public readonly opposite: string;

    constructor(value: string, opposite: string) {
        super(value);
        this.opposite = opposite;
    }

    public upper(): string {
        return this.value.toUpperCase();
    }
}

const Colors = EnumEntry.seal(Color);

describe("Enumeration", () => {
    describe("values", () => {
        it("returns all the valid enum values", () => {
            expect(Colors.values).toEqual([Colors.RED.value, Colors.BLUE.value, Colors.YELLOW.value]);
        });
    });

    describe("entries", () => {
        it("returns all the valid enum entries", () => {
            expect(Colors.entries).toEqual([Colors.RED, Colors.BLUE, Colors.YELLOW]);
        });
    });

    describe("withValue", () => {
        it("returns Some(enum) with matching value", () => {
            const color = Colors.withValue("red");
            expect(color.contains(Colors.RED)).toEqual(true);
        });

        it("return None with no matching value", () => {
            const color = Colors.withValue("green");
            expect(color.isEmpty()).toEqual(true);
        });
    });

    describe("withName", () => {
        it("returns Some(enum) with matching name", () => {
            const color = Colors.withName("BLUE");
            expect(color.contains(Colors.BLUE)).toEqual(true);
        });

        it("returns None with no matching name", () => {
            const color = Colors.withName("GREEN");
            expect(color.isEmpty()).toEqual(true);
        });
    });

    describe("custom values and methods", () => {
        it("allows custom values and methods defined on the class", () => {
            const color = Colors.withValue("yellow").get();
            expect(color.opposite).toEqual("purple");
            expect(color.upper()).toEqual("YELLOW");
        });
    });
});
