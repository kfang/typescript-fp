import { Either } from "../src";

describe("Either", () => {
    describe("flatMap()", () => {
        it("applies the function to the right value", () => {
            const res = Either.right(100)

                .flatMap((num) => Either.right(num + 100))

                .case({
                    right: (num) => num,
                    left: () => {
                        throw new Error();
                    },
                });
            expect(res).toEqual(200);
        });

        it("applies the function to the left value", () => {
            const res = Either.right(100)
                .flatMap((num) => Either.left(num + 100))
                .case({
                    right: () => {
                        throw new Error();
                    },
                    left: (num) => num,
                });
            expect(res).toEqual(200);
        });
    });

    describe("isLeft()", () => {
        it("returns false", () => {
            expect(Either.right(123).isLeft()).toEqual(false);
        });
    });

    describe("isRight()", () => {
        it("returns true", () => {
            expect(Either.right(123).isRight()).toEqual(true);
        });
    });

    describe("map()", () => {
        it("apples the function only");
    });
});
