import "@abraham/reflection";
import { ProtobufLiteProperty } from "../src";
import { getMetadataObject } from "../src/metadataHelpers";

describe("getMetadataObject(XXX).getFieldInfo", () => {
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

    expect(getMetadataObject(C1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "name", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(C2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "name", prototype: "string", rule: "optional" }
    ]);

    expect(getMetadataObject(C3).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(C1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "age", prototype: "int32", rule: "required" }
    ]);

    expect(getMetadataObject(C2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "age", prototype: "int32", rule: "optional" }
    ]);

    expect(getMetadataObject(C3).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(C1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "isTrue", prototype: "bool", rule: "required" }
    ]);

    expect(getMetadataObject(C2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "isTrue", prototype: "bool", rule: "optional" }
    ]);

    expect(getMetadataObject(C3).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(C1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "buffer", prototype: "bytes", rule: "required" }
    ]);

    expect(getMetadataObject(C2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "buffer", prototype: "bytes", rule: "optional" }
    ]);

    expect(getMetadataObject(C3).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(C1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "date", prototype: "bytes", rule: "required" }
    ]);

    expect(getMetadataObject(C2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "date", prototype: "bytes", rule: "optional" }
    ]);

    expect(getMetadataObject(C3).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(Child).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(C1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(C2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(C3).collectFieldsInfo()).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" },
      { propertyKey: "c3", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(C4).collectFieldsInfo()).toMatchObject([
      { propertyKey: "c1", prototype: "string", rule: "required" },
      { propertyKey: "c2", prototype: "string", rule: "required" },
      { propertyKey: "c3", prototype: "string", rule: "required" },
      { propertyKey: "c4", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(C5).collectFieldsInfo()).toMatchObject([
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

    expect(getMetadataObject(Child).collectFieldsInfo()).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(Child1).collectFieldsInfo()).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(Child2).collectFieldsInfo()).toMatchObject([
      { propertyKey: "someField", prototype: "string", rule: "required" }
    ]);

    expect(getMetadataObject(Child3).collectFieldsInfo()).toMatchObject([
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

    expect(() => getMetadataObject(Child).collectFieldsInfo()).toThrowError();
  });
});
