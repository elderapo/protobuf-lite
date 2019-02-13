import "@abraham/reflection";

import { calculateProtobufLiteClassChecksum, ProtobufLiteProperty, getFieldInfo } from "../src";

describe("getFieldInfo", () => {
  it("should throw if provided class with no metadata", () => {
    class C1 {}

    expect(() => getFieldInfo(C1)).toThrowError();
  });

  it("should return correct fields for strings", () => {
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

    expect(getFieldInfo(C1)).toMatchObject([
      { propertyKey: "name", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(C2)).toMatchObject([
      { propertyKey: "name", prototype: "string", rule: "optional" }
    ]);

    expect(getFieldInfo(C3)).toMatchObject([
      { propertyKey: "names", prototype: "string", rule: "repeated" }
    ]);
  });

  it("should return correct fields for numbers", () => {
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

    expect(getFieldInfo(C1)).toMatchObject([
      { propertyKey: "age", prototype: "int32", rule: "required" }
    ]);

    expect(getFieldInfo(C2)).toMatchObject([
      { propertyKey: "age", prototype: "int32", rule: "optional" }
    ]);

    expect(getFieldInfo(C3)).toMatchObject([
      { propertyKey: "ages", prototype: "int32", rule: "repeated" }
    ]);
  });

  it("should return correct fields for booleans", () => {
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

    expect(getFieldInfo(C1)).toMatchObject([
      { propertyKey: "isTrue", prototype: "bool", rule: "required" }
    ]);

    expect(getFieldInfo(C2)).toMatchObject([
      { propertyKey: "isTrue", prototype: "bool", rule: "optional" }
    ]);

    expect(getFieldInfo(C3)).toMatchObject([
      { propertyKey: "isTrues", prototype: "bool", rule: "repeated" }
    ]);
  });

  it("should return correct fields for Buffers", () => {
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

    expect(getFieldInfo(C1)).toMatchObject([
      { propertyKey: "buffer", prototype: "bytes", rule: "required" }
    ]);

    expect(getFieldInfo(C2)).toMatchObject([
      { propertyKey: "buffer", prototype: "bytes", rule: "optional" }
    ]);

    expect(getFieldInfo(C3)).toMatchObject([
      { propertyKey: "buffers", prototype: "bytes", rule: "repeated" }
    ]);
  });

  it("should return correct fields for Dates", () => {
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

    expect(getFieldInfo(C1)).toMatchObject([
      { propertyKey: "date", prototype: "bytes", rule: "required" }
    ]);

    expect(getFieldInfo(C2)).toMatchObject([
      { propertyKey: "date", prototype: "bytes", rule: "optional" }
    ]);

    expect(getFieldInfo(C3)).toMatchObject([
      { propertyKey: "dates", prototype: "bytes", rule: "repeated" }
    ]);
  });

  it("should return correct fields for inhreited classes v1", () => {
    class Parent {
      @ProtobufLiteProperty()
      someField: string;
    }

    class Child extends Parent {
      @ProtobufLiteProperty()
      someOtherField: string;
    }

    expect(getFieldInfo(Child)).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" },
      { propertyKey: "someOtherField", prototype: "string", rule: "required" }
    ]);
  });

  it("should return correct fields for inhreited classes v2", () => {
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

    expect(getFieldInfo(C1)).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(C2)).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(C3)).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" },
      { propertyKey: "c3", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(C4)).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" },
      { propertyKey: "c3", prototype: "string", rule: "required" },
      { propertyKey: "c4", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(C5)).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" },
      { propertyKey: "c3", prototype: "string", rule: "required" },
      { propertyKey: "c4", prototype: "string", rule: "required" },
      { propertyKey: "c5", prototype: "string", rule: "required" }
    ]);
  });

  it("should return correct fields for inhreited classes v3", () => {
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

    expect(getFieldInfo(Child)).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(Child1)).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(Child2)).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" }
    ]);

    expect(getFieldInfo(Child3)).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" },
      { propertyKey: "c3", prototype: "string", rule: "required" }
    ]);
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

    expect(() => getFieldInfo(Child)).toThrowError();
  });
});

describe("calculateProtobufLiteClassChecksum", () => {
  it("should throw if provided class with no metadata", () => {
    class C1 {}

    expect(() => calculateProtobufLiteClassChecksum(C1)).toThrowError();
  });

  it("should correctly calculate checksums for strings", () => {
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

    expect(calculateProtobufLiteClassChecksum(C1)).toBe("32e9334202f312b74fff2d09be415564a44dfef1");

    expect(calculateProtobufLiteClassChecksum(C2)).toBe("44fbe764c884bdcd4299031a6c95a3e18f7f94d9");

    expect(calculateProtobufLiteClassChecksum(C2)).not.toBe(calculateProtobufLiteClassChecksum(C1));

    expect(calculateProtobufLiteClassChecksum(C3)).toBe("921e745f25d63deb80936b9daf428cdd46ed4587");
  });

  it("should correctly calculate checksums for numbers", () => {
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

    expect(calculateProtobufLiteClassChecksum(C1)).toBe("5571947d7ad3108fd28ddc5d5887efc147fb29ed");

    expect(calculateProtobufLiteClassChecksum(C2)).toBe("82b88e10120379d3ff74642f97fdb1259e1f3105");

    expect(calculateProtobufLiteClassChecksum(C2)).not.toBe(calculateProtobufLiteClassChecksum(C1));

    expect(calculateProtobufLiteClassChecksum(C3)).toBe("c86042ccf8f1f14230c39a6b068edf1ea66ab55b");
  });

  it("should correctly calculate checksums for booleans", () => {
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

    expect(calculateProtobufLiteClassChecksum(C1)).toBe("a2bdd3e45393664b445d6d1aad867da8924c4b99");

    expect(calculateProtobufLiteClassChecksum(C2)).toBe("927b5fc6c9ec24e48e419c7aa457e44a5b41e073");

    expect(calculateProtobufLiteClassChecksum(C2)).not.toBe(calculateProtobufLiteClassChecksum(C1));

    expect(calculateProtobufLiteClassChecksum(C3)).toBe("13eb813067b5e4d33b53952296b008a4d8dc1010");
  });

  it("should correctly calculate checksums for Buffers", () => {
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

    expect(calculateProtobufLiteClassChecksum(C1)).toBe("770d94168c43759c43f0c58dfcc77f79bbfca37d");

    expect(calculateProtobufLiteClassChecksum(C2)).toBe("af573da26ae1d154ec49e9394e2acbec5deede50");

    expect(calculateProtobufLiteClassChecksum(C2)).not.toBe(calculateProtobufLiteClassChecksum(C1));

    expect(calculateProtobufLiteClassChecksum(C3)).toBe("b8e55fd8d90550054825391ce03701c5adc9e455");
  });

  it("should correctly calculate checksums for Dates", () => {
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

    expect(calculateProtobufLiteClassChecksum(C1)).toBe("1171038b07f309f5539d04618a4dc1f9d4e1f3f1");

    expect(calculateProtobufLiteClassChecksum(C2)).toBe("3dd64c6895f3e1b65f957d100e4040d30a45a977");

    expect(calculateProtobufLiteClassChecksum(C2)).not.toBe(calculateProtobufLiteClassChecksum(C1));

    expect(calculateProtobufLiteClassChecksum(C3)).toBe("d9d1b2e83e64f6c3f9d1ebdcc5499d04a781b89e");
  });

  it("should correctly calculate checksums for inherited classes", () => {
    class Parent {
      @ProtobufLiteProperty()
      parent: string;
    }

    class Child extends Parent {
      @ProtobufLiteProperty()
      child: string;
    }

    class ParentAndChild {
      @ProtobufLiteProperty()
      parent: string;

      @ProtobufLiteProperty()
      child: string;
    }

    expect(calculateProtobufLiteClassChecksum(Parent)).not.toBe(
      calculateProtobufLiteClassChecksum(Child)
    );

    expect(calculateProtobufLiteClassChecksum(Parent)).not.toBe(
      calculateProtobufLiteClassChecksum(ParentAndChild)
    );

    expect(calculateProtobufLiteClassChecksum(Child)).toBe(
      calculateProtobufLiteClassChecksum(ParentAndChild)
    );
  });
});
