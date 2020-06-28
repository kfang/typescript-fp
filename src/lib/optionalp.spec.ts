import { Optional } from "./optional";
import { OptionalP } from "./optionalp";

function testfn(str: string): Promise<Optional<string>> {
    const x: OptionalP<string> = OptionalP.ofP(Optional.of(Promise.resolve(str)));
    return x
        .map((s) => s.length)
        .pMap((num) => Promise.resolve(num))
        .flatMap((num) => Optional.of(["hello", "world"][num]))
        .get();
}

test("should return hello", async () => {
    const res = await testfn("");
    expect(res.contains("hello")).toEqual(true);
});

test("should return world", async () => {
    const res = await testfn("a");
    expect(res.contains("world")).toBeTruthy();
});

test("should return empty", async () => {
    const res = await testfn("ab");
    expect(res.isEmpty()).toEqual(true);
});

test("should return empty over flatmap", async () => {
    const p = await OptionalP.empty().get();
    expect(p.isEmpty()).toEqual(true);
});
