import { ensureBuffer, getPrototypeChain } from "../src/utils";

describe("getPrototypeChain", () => {
  it("should correctly work", () => {
    class C1 {}

    class C2 extends C1 {}
    class C3 extends C2 {}
    class C4 extends C3 {}
    class C5 extends C4 {}

    expect(getPrototypeChain(C1)).toMatchObject([C1.prototype]);

    expect(getPrototypeChain(C2)).toMatchObject([C2.prototype, C1.prototype]);
    expect(getPrototypeChain(C3)).toMatchObject([C3.prototype, C2.prototype, C1.prototype]);
    expect(getPrototypeChain(C4)).toMatchObject([
      C4.prototype,
      C3.prototype,
      C2.prototype,
      C1.prototype
    ]);

    expect(getPrototypeChain(C5)).toMatchObject([
      C5.prototype,
      C4.prototype,
      C3.prototype,
      C2.prototype,
      C1.prototype
    ]);

    expect(getPrototypeChain(Number)).toMatchObject([Number.prototype]);
    expect(getPrototypeChain(String)).toMatchObject([String.prototype]);
    expect(getPrototypeChain(Symbol)).toMatchObject([Symbol.prototype]);
    expect(getPrototypeChain(Array)).toMatchObject([Array.prototype]);

    expect(() => getPrototypeChain(null as any)).toThrowError();
    expect(() => getPrototypeChain(undefined as any)).toThrowError();
  });
});

describe("ensureBuffer", () => {
  it("should accept buffer", () => {
    expect(ensureBuffer(Buffer.from([1, 2, 3]))).toMatchObject(Buffer.from([1, 2, 3]));

    expect(ensureBuffer(Buffer.from([1, 2, 4]))).not.toMatchObject(Buffer.from([1, 2, 3]));
    expect(ensureBuffer(Buffer.from([1, 2]))).not.toMatchObject(Buffer.from([1, 2, 3]));
  });

  it("should accept Uint8Array", () => {
    expect(ensureBuffer(new Uint8Array([1, 2, 3]))).toMatchObject(Buffer.from([1, 2, 3]));

    expect(ensureBuffer(new Uint8Array([1, 2, 4]))).not.toMatchObject(Buffer.from([1, 2, 3]));
    expect(ensureBuffer(new Uint8Array([1, 2]))).not.toMatchObject(Buffer.from([1, 2, 3]));
  });
});
