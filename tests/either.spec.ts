import { Either } from "../src";

describe("Either", () => {
    describe("isLeft()", () => {
        it("correctly identifies a Left", () => {
            expect(Either.isLeft(Either.right(123))).toEqual(false);
            expect(Either.isLeft(Either.left(123))).toEqual(true);
        });
    });

    describe("isRight()", () => {
        it("correctly identifies a Right", () => {
            expect(Either.isRight(Either.right(123))).toEqual(true);
            expect(Either.isRight(Either.left(123))).toEqual(false);
        });
    });

    describe("flatMap()", () => {
        it("applies the function and returns a right", () => {
            const right = Either.right(100).flatMap((num) => Either.right(num + 100));
            expect(right.isRight()).toEqual(true);
            expect(right.isLeft()).toEqual(false);

            const res = right.case({
                right: (num) => num,
                left: () => fail("should not apply"),
            });
            expect(res).toEqual(200);
        });

        it("applies the function and returns a left", () => {
            const left = Either.right(100).flatMap((num) => Either.left(num + 100));
            expect(left.isLeft()).toEqual(true);
            expect(left.isRight()).toEqual(false);

            const res = left.case({
                right: () => fail("should not apply"),
                left: (num) => num,
            });
            expect(res).toEqual(200);
        });

        it("does not apply the function", () => {
            const left = Either.left(100).flatMap(() => fail("should not apply"));
            expect(left.isLeft()).toEqual(true);
            expect(left.isRight()).toEqual(false);

            const res = left.case({
                left: (num) => num,
                right: () => fail("should not apply"),
            });
            expect(res).toEqual(100);
        });
    });

    describe("map()", () => {
        it("applies the function to a right", () => {
            const right = Either.right(123).map((num) => num + 123);
            expect(right.isRight()).toEqual(true);

            const res = right.case({
                left: () => fail("should not apply"),
                right: (num) => num,
            });
            expect(res).toEqual(246);
        });

        it("does not apply the function to a left", () => {
            const left = Either.left<number, number>(123).map((num) => num + 123);
            expect(left.isRight()).toEqual(false);
            expect(left.isLeft()).toEqual(true);

            const res = left.case({
                left: (num) => num,
                right: () => fail("should not apply"),
            });
            expect(res).toEqual(123);
        });
    });

    describe("mapRight()", () => {
        it("applies the function to a right", () => {
            const right = Either.right(123).mapRight((num) => num + 123);
            expect(right.isRight()).toEqual(true);

            const res = right.case({
                left: () => fail("should not apply"),
                right: (num) => num,
            });
            expect(res).toEqual(246);
        });

        it("does not apply the function to a left", () => {
            const left = Either.left<number, number>(123).mapRight((num) => num + 123);
            expect(left.isRight()).toEqual(false);
            expect(left.isLeft()).toEqual(true);

            const res = left.case({
                left: (num) => num,
                right: () => fail("should not apply"),
            });
            expect(res).toEqual(123);
        });
    });

    describe("mapLeft()", () => {
        it("applies the function to a left", () => {
            const left = Either.left(123).mapLeft((num) => num + 123);
            expect(left.isLeft()).toEqual(true);

            const res = left.case({
                left: (num) => num,
                right: () => fail("should not apply"),
            });
            expect(res).toEqual(246);
        });

        it("does not apply the function to a right", () => {
            const right = Either.right(123).mapLeft(() => fail("should not apply"));
            expect(right.isRight()).toEqual(true);
            expect(right.isLeft()).toEqual(false);

            const res = right.case({
                right: (num) => num,
                left: () => fail("should not apply"),
            });
            expect(res).toEqual(123);
        });
    });
});
