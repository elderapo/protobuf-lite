import "@abraham/reflection";
import { ProtobufLiteProperty } from "../src";
import {} from "../src/metadataHelpers";
import { collectSchema } from "../src/collectSchema";

describe("collectSchema(MessageClass)", () => {
  it("should return correct schema for strings", () => {
    class C1 {
      @ProtobufLiteProperty()
      name: string;
    }

    class C2 {
      @ProtobufLiteProperty({ optional: true })
      name?: string;
    }

    class C3 {
      @ProtobufLiteProperty({ type: () => String })
      names: string[];
    }

    expect(collectSchema(C1)).toMatchSnapshot();

    expect(collectSchema(C2)).toMatchSnapshot();

    expect(collectSchema(C3)).toMatchSnapshot();
  });

  it("should return correct schema for numbers", () => {
    class C1 {
      @ProtobufLiteProperty()
      age: number;
    }

    class C2 {
      @ProtobufLiteProperty({ optional: true })
      age?: number;
    }

    class C3 {
      @ProtobufLiteProperty({ type: () => Number })
      ages: number[];
    }

    expect(collectSchema(C1)).toMatchSnapshot();

    expect(collectSchema(C2)).toMatchSnapshot();

    expect(collectSchema(C3)).toMatchSnapshot();
  });

  it("should return correct schema for booleans", () => {
    class C1 {
      @ProtobufLiteProperty()
      isTrue: boolean;
    }

    class C2 {
      @ProtobufLiteProperty({ optional: true })
      isTrue?: boolean;
    }

    class C3 {
      @ProtobufLiteProperty({ type: () => Boolean })
      isTrues: boolean[];
    }

    expect(collectSchema(C1)).toMatchSnapshot();

    expect(collectSchema(C2)).toMatchSnapshot();

    expect(collectSchema(C3)).toMatchSnapshot();
  });

  it("should return correct schema for Buffers", () => {
    class C1 {
      @ProtobufLiteProperty()
      buffer: Buffer;
    }

    class C2 {
      @ProtobufLiteProperty({ optional: true })
      buffer?: Buffer;
    }

    class C3 {
      @ProtobufLiteProperty({ type: () => Buffer })
      buffers: Buffer[];
    }

    expect(collectSchema(C1)).toMatchSnapshot();

    expect(collectSchema(C2)).toMatchSnapshot();

    expect(collectSchema(C3)).toMatchSnapshot();
  });

  it("should return correct schema for Dates", () => {
    class C1 {
      @ProtobufLiteProperty()
      date: Date;
    }

    class C2 {
      @ProtobufLiteProperty({ optional: true })
      date?: Date;
    }

    class C3 {
      @ProtobufLiteProperty({ type: () => Date })
      dates: Date[];
    }

    expect(collectSchema(C1)).toMatchSnapshot();

    expect(collectSchema(C2)).toMatchSnapshot();

    expect(collectSchema(C3)).toMatchSnapshot();
  });

  it("should return correct schema for inhreited classes v1", () => {
    class Parent {
      @ProtobufLiteProperty()
      someField: string;
    }

    class Child extends Parent {
      @ProtobufLiteProperty()
      someOtherField: string;
    }

    expect(collectSchema(Child)).toMatchSnapshot();
  });

  it("should return correct schema for inhreited classes v2", () => {
    class C1 {
      @ProtobufLiteProperty()
      c1: string;
    }

    class C2 extends C1 {
      @ProtobufLiteProperty()
      c2: string;
    }

    class C3 extends C2 {
      @ProtobufLiteProperty()
      c3: string;
    }

    class C4 extends C3 {
      @ProtobufLiteProperty()
      c4: string;
    }

    class C5 extends C4 {
      @ProtobufLiteProperty()
      c5: string;
    }

    expect(collectSchema(C1)).toMatchSnapshot();

    expect(collectSchema(C2)).toMatchSnapshot();

    expect(collectSchema(C3)).toMatchSnapshot();

    expect(collectSchema(C4)).toMatchSnapshot();

    expect(collectSchema(C5)).toMatchSnapshot();
  });

  it("should return correct schema for inhreited classes v3", () => {
    class Parent {
      @ProtobufLiteProperty()
      someField: string;
    }

    class Child extends Parent {}
    class Child1 extends Child {}
    class Child2 extends Child1 {}
    class Child3 extends Child1 {
      @ProtobufLiteProperty()
      c3: string;
    }

    expect(collectSchema(Child)).toMatchSnapshot();

    expect(collectSchema(Child1)).toMatchSnapshot();

    expect(collectSchema(Child2)).toMatchSnapshot();

    expect(collectSchema(Child3)).toMatchSnapshot();
  });

  it("should return correct schema for nestedClasses", () => {
    class C3 {
      @ProtobufLiteProperty()
      iAmC3: string;
    }

    class C2 {
      @ProtobufLiteProperty()
      c3: C3;

      @ProtobufLiteProperty()
      iAmC2: string;
    }

    class C1 {
      @ProtobufLiteProperty()
      c2: C2;

      @ProtobufLiteProperty()
      iAmC1: string;
    }

    class CMain {
      @ProtobufLiteProperty()
      c1_0: C1;

      @ProtobufLiteProperty()
      c1_1: C1;

      @ProtobufLiteProperty()
      c1_2: C1;

      @ProtobufLiteProperty()
      cMainYooo: string;
    }

    expect(collectSchema(CMain)).toMatchSnapshot();
  });

  it("should throw if child overwrites parent fields", () => {
    class Parent {
      @ProtobufLiteProperty()
      someField: string;
    }

    class Child extends Parent {
      @ProtobufLiteProperty()
      someField: string;
    }

    expect(() => collectSchema(Child)).toThrowError();
  });
});
