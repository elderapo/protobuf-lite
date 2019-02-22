import "@abraham/reflection";
import * as deepFreeze from "deep-freeze";
import { decode, encode, ProtobufLiteProperty } from "../src";
import { clearAllMetadata } from "../src/metadataHelpers";

describe("protobuf-lite", () => {
  afterEach(() => {
    clearAllMetadata();
  });

  it("optional array is not permitted", () => {
    expect(() => {
      class SimpleMessage {
        @ProtobufLiteProperty({ type: () => Number, optional: true })
        public someNumbers: number[];
      }
    }).toThrowError();
  });

  it("encode should throw if it can't verify payload shape", () => {
    class SimpleMessage {
      @ProtobufLiteProperty()
      public awesomeField: string;

      @ProtobufLiteProperty()
      public someBoolean: boolean;

      @ProtobufLiteProperty()
      public someNumber: number;
    }

    expect(() => encode(SimpleMessage, null as any)).toThrowError();
    expect(() => encode(SimpleMessage, { awesomeField: "aaa", someBoolean: true })).toThrowError();
    expect(() => encode(SimpleMessage, { awesomeField: "aaa", someNumber: 1 })).toThrowError();
    expect(() => encode(SimpleMessage, { someNumber: 111, someBoolean: true })).toThrowError();
  });

  it("encode should respect optional types", () => {
    class SimpleMessage {
      @ProtobufLiteProperty({ optional: true })
      public awesomeField: string;

      @ProtobufLiteProperty({ optional: true })
      public someBoolean: boolean;

      @ProtobufLiteProperty({ optional: true })
      public someNumber: number;

      @ProtobufLiteProperty({ optional: true })
      public date: Date;
    }

    expect(() => encode(SimpleMessage, null as any)).toThrowError();

    const encDecExpectSameResult = (payload: any) => {
      expect(decode(SimpleMessage, encode(SimpleMessage, payload))).toMatchObject(payload);
    };

    encDecExpectSameResult({ awesomeField: "aaa" });
    encDecExpectSameResult({ awesomeField: "aaa", someNumber: 666 });
    encDecExpectSameResult({
      awesomeField: "aaa",
      someNumber: 666,
      someBoolean: true
    });
    encDecExpectSameResult({
      awesomeField: "aaa",
      someNumber: 666,
      someBoolean: true,
      date: new Date()
    });
  });

  it("should correctly encode/decode simple messge", () => {
    class SimpleMessage {
      @ProtobufLiteProperty()
      public awesomeField: string;

      @ProtobufLiteProperty()
      public someBoolean: boolean;

      @ProtobufLiteProperty()
      public someNumber: number;
    }

    const simpleMessage: SimpleMessage = {
      awesomeField: "yeeeee",
      someBoolean: true,
      someNumber: 666
    };

    deepFreeze(simpleMessage);

    const encoded = encode(SimpleMessage, simpleMessage);
    const decoded = decode(SimpleMessage, encoded);

    expect(Buffer.isBuffer(encoded)).toBe(true);
    expect(decoded).toBeInstanceOf(SimpleMessage);
    expect(decoded).toMatchObject(simpleMessage);
  });

  it("should corrrectly encode/decode simple messages with arrays", () => {
    class SimpleMessageWithArrays {
      @ProtobufLiteProperty()
      public awesomeField: string;

      @ProtobufLiteProperty()
      public someBoolean: boolean;

      @ProtobufLiteProperty()
      public someNumber: number;

      @ProtobufLiteProperty({ type: () => String })
      public awesomeFieldArray: string[];

      @ProtobufLiteProperty({ type: () => Boolean })
      public someBooleanArray: boolean[];

      @ProtobufLiteProperty({ type: () => Number })
      public someNumberArray: number[];
    }

    const simpleMessageWithArrays: SimpleMessageWithArrays = {
      awesomeField: "yeeeee",
      someBoolean: true,
      someNumber: 666,
      awesomeFieldArray: ["yeee", "jajajaja", "ehuehuehuehe", "jkfksdfjksd"],
      someBooleanArray: [true, false, false, true, true, false],
      someNumberArray: [1, 242432, 3, 5, 6, 4, 6, 7, 83, 66, 35443543]
    };

    deepFreeze(simpleMessageWithArrays);

    const encoded = encode(SimpleMessageWithArrays, simpleMessageWithArrays);
    const decoded = decode(SimpleMessageWithArrays, encoded);

    expect(Buffer.isBuffer(encoded)).toBe(true);
    expect(decoded).toBeInstanceOf(SimpleMessageWithArrays);
    expect(decoded).toMatchObject({
      awesomeField: "yeeeee",
      someBoolean: true,
      someNumber: 666,
      awesomeFieldArray: ["yeee", "jajajaja", "ehuehuehuehe", "jkfksdfjksd"],
      someBooleanArray: [true, false, false, true, true, false],
      someNumberArray: [1, 242432, 3, 5, 6, 4, 6, 7, 83, 66, 35443543]
    });
  });

  it("should correctly encode/decode complicated message", () => {
    class ChildMessageC {
      @ProtobufLiteProperty()
      public c: string;
    }

    class ChildMessageB {
      @ProtobufLiteProperty()
      public b: string;

      @ProtobufLiteProperty()
      public childC: ChildMessageC;
    }

    class ChildMessageA {
      @ProtobufLiteProperty()
      public a: string;

      @ProtobufLiteProperty()
      public childB: ChildMessageB;
    }

    class AwesomeMessage {
      @ProtobufLiteProperty()
      public awesomeField: string;

      @ProtobufLiteProperty()
      public someBoolean: boolean;

      @ProtobufLiteProperty({ type: () => Boolean })
      public booleanArray: boolean[];

      @ProtobufLiteProperty()
      public createdAt: Date;

      @ProtobufLiteProperty()
      public child: ChildMessageA;

      @ProtobufLiteProperty({ type: () => ChildMessageC })
      public childCArray: ChildMessageC[];

      @ProtobufLiteProperty({ type: () => Date })
      public datesArray: Date[];
    }

    const awesomeMessagePayload: AwesomeMessage = {
      awesomeField: "dupa",
      someBoolean: true,
      booleanArray: [true, true, false, false, true],
      createdAt: new Date(),
      child: { a: "aaa", childB: { b: "bbb", childC: { c: "ccc" } } },
      childCArray: [{ c: "childC1" }, { c: "childC2" }, { c: "childC3" }],
      datesArray: [new Date(), new Date(), new Date()]
    };

    deepFreeze(awesomeMessagePayload);

    const encoded = encode(AwesomeMessage, awesomeMessagePayload);
    const decoded = decode(AwesomeMessage, encoded);

    expect(Buffer.isBuffer(encoded)).toBe(true);

    expect(decoded).toBeInstanceOf(AwesomeMessage);
    expect(decoded.awesomeField).toBe("dupa");
    expect(decoded.someBoolean).toBe(true);

    expect(decoded.booleanArray).toBeInstanceOf(Array);
    expect(awesomeMessagePayload.booleanArray).toMatchObject(decoded.booleanArray);

    expect(decoded.createdAt).toBeInstanceOf(Date);
    expect(decoded.createdAt.getTime()).toBe(awesomeMessagePayload.createdAt.getTime());

    expect(decoded.child).toBeInstanceOf(ChildMessageA);
    expect(decoded.child.a).toBe("aaa");

    expect(decoded.child.childB).toBeInstanceOf(ChildMessageB);
    expect(decoded.child.childB.b).toBe("bbb");

    expect(decoded.child.childB.childC).toBeInstanceOf(ChildMessageC);
    expect(decoded.child.childB.childC.c).toBe("ccc");

    expect(decoded.childCArray[0]).toBeInstanceOf(ChildMessageC);
    expect(decoded.childCArray[1]).toBeInstanceOf(ChildMessageC);
    expect(decoded.childCArray[2]).toBeInstanceOf(ChildMessageC);

    expect(decoded.childCArray[0].c).toBe("childC1");
    expect(decoded.childCArray[1].c).toBe("childC2");
    expect(decoded.childCArray[2].c).toBe("childC3");

    expect(decoded.datesArray).toBeInstanceOf(Array);
    expect(decoded.datesArray.length).toBe(3);
    expect(decoded.datesArray[0]).toBeInstanceOf(Date);
    expect(decoded.datesArray[1]).toBeInstanceOf(Date);
    expect(decoded.datesArray[2]).toBeInstanceOf(Date);
  });

  it("should correctly encode/decoded enums", () => {
    enum NormalEnum {
      Value1,
      Value2
    }

    enum StringEnum {
      Value1 = "aaa",
      Value2 = "bbb"
    }

    class SimpleMessage {
      @ProtobufLiteProperty()
      public normalEnum: NormalEnum;

      @ProtobufLiteProperty()
      public stringEnum: StringEnum;
    }

    const payload: SimpleMessage = {
      normalEnum: NormalEnum.Value2,
      stringEnum: StringEnum.Value1
    };

    const encoded = encode(SimpleMessage, payload);
    const decoded = decode(SimpleMessage, encoded);

    expect(decoded).toMatchObject(payload);
    expect(decoded.normalEnum).toBe(NormalEnum.Value2);
    expect(decoded.stringEnum).toBe(StringEnum.Value1);
  });

  it("should respect required/optional fields", () => {
    class TestClass {
      @ProtobufLiteProperty({ optional: true })
      date: Date;
    }

    expect(() => encode(TestClass, {})).not.toThrowError();

    class ChildOptional {
      @ProtobufLiteProperty({ optional: true })
      name?: string;
    }

    class ParentOptional {
      @ProtobufLiteProperty()
      child: ChildOptional;
    }

    class ChildNotOptional {
      @ProtobufLiteProperty()
      name: string;
    }

    class ParentNotOptional {
      @ProtobufLiteProperty()
      child: ChildNotOptional;
    }

    const shapeWithOptionalEncoded = encode(ParentOptional, { child: {} });

    expect(() => decode(ParentNotOptional, shapeWithOptionalEncoded)).toThrowError();
  });

  it("should correctly encode/decode messages managed with different classes as long as thier field types match", () => {
    class Class1 {
      @ProtobufLiteProperty()
      public a: string;

      @ProtobufLiteProperty()
      public b: number;

      @ProtobufLiteProperty()
      public c: boolean;

      @ProtobufLiteProperty()
      public d: Date;

      @ProtobufLiteProperty({ type: () => Number })
      public e: number[];
    }

    class Class2 {
      @ProtobufLiteProperty()
      public _a: string;

      @ProtobufLiteProperty()
      public _b: number;

      @ProtobufLiteProperty()
      public _c: boolean;

      @ProtobufLiteProperty()
      public _d: Date;

      @ProtobufLiteProperty({ type: () => Number })
      public _e: number[];
    }

    const payload: Class1 = { a: "aaa", b: 123, c: true, d: new Date(), e: [1, 2, 3] };

    const encoded = encode(Class1, payload);
    const decoded = decode(Class2, encoded);

    const newObject: any = {};

    Object.keys(decoded).map(key => {
      const d: any = decoded;
      const value = d[key];

      newObject[key.replace("_", "")] = value;
    });

    expect(payload).toMatchObject(newObject);
  });

  it("message inheritance", () => {
    class Parent {
      @ProtobufLiteProperty()
      public parentString: string;

      @ProtobufLiteProperty()
      public parentBoolean: boolean;

      @ProtobufLiteProperty()
      public parentNumber: number;
    }

    class Child extends Parent {
      @ProtobufLiteProperty()
      public childString: string;

      @ProtobufLiteProperty()
      public childBoolean: boolean;

      @ProtobufLiteProperty()
      public childNumber: number;
    }

    const payload: Child = {
      parentString: "aaa",
      parentBoolean: true,
      parentNumber: 666,

      childString: "bbb",
      childBoolean: false,
      childNumber: 132
    };

    const encoded = encode(Child, payload);
    const decoded = decode(Child, encoded);

    expect(decoded).toMatchObject(payload);
  });

  it("inheritance overwrite error", () => {
    class Parent {
      @ProtobufLiteProperty()
      name: string;
    }

    class Child extends Parent {
      @ProtobufLiteProperty()
      name: string;
    }

    expect(() => encode(Child, { name: "amachild" })).toThrowError();
  });

  it("error cases", () => {
    class EmptyClass {}

    expect(() => encode(EmptyClass, {})).toThrowError();
    expect(() => decode(EmptyClass, Buffer.alloc(0))).toThrowError();

    class Shape1 {
      @ProtobufLiteProperty({ optional: true })
      name?: string;
    }

    class Shape2 {
      @ProtobufLiteProperty()
      name: string;
    }

    const shape1Encoded = encode(Shape1, {});

    expect(() => decode(Shape2, shape1Encoded)).toThrowError();

    expect(() => {
      class Mistmatch {
        @ProtobufLiteProperty({ type: () => Number })
        name: string;
      }
    }).toThrowError();
  });

  it("array error cases", () => {
    expect(() => {
      class Message {
        @ProtobufLiteProperty()
        arr: Array<any>;
      }
    }).toThrowError();

    expect(() => {
      class Message {
        @ProtobufLiteProperty({ type: () => Array })
        arr: Array<any>;
      }
    }).toThrowError();
  });

  it("should throw on symbol fields", () => {
    expect(() => {
      class TestClass {
        @ProtobufLiteProperty()
        symbol: symbol;
      }
    }).toThrowError();

    expect(() => {
      class TestClass {
        @ProtobufLiteProperty()
        symbol: Symbol;
      }
    }).toThrowError();
  });

  it("on iterface type should fallback to type obtained from decorator", () => {
    interface IPerson {
      name: string;
      age: number;
    }

    class Person implements IPerson {
      @ProtobufLiteProperty()
      name: string;

      @ProtobufLiteProperty()
      age: number;
    }

    expect(() => {
      class TestClassWrong {
        @ProtobufLiteProperty()
        person: IPerson;
      }
    }).toThrowError();

    expect(() => {
      class TestClassOK {
        @ProtobufLiteProperty({ type: () => Person })
        person: IPerson;
      }
    }).not.toThrowError();
  });
});
