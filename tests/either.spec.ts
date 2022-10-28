import { Either } from "../src";

describe("Either", () => {
    describe("Right", () => {
        describe("flatMap()", () => {
            it("applies the function to the right value", () => {
                const res = Either.right(100).flatMap((num) => Either.right(num + 100)).case({
                    right: (num) => num,
                    left: () => { throw new Error() },
                });
                expect(res).toEqual(200);
            });

            it("applies the function to the left value", () => {
                const res =  Either.right(100).flatMap((num) => Either.left(num + 100)).case({
                    right: () => { throw new Error() },
                    left: (num) => num,
                });
                expect(res).toEqual(200);
            });
        });
    });
});