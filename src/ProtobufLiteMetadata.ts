import { Field, Type } from "protobufjs/light";
import { ICustomFieldCodec, InternalCodecs } from "./codecs";
import { getMetadataObject, hasMetadataObject } from "./metadataHelpers";
import { defaultProtobufLitePropertyOptions } from "./ProtobufLiteProperty";
import { Constructable, getPrototypeChain, ensureBuffer } from "./utils";

export interface IProtobufLitePropertyOptions {
  optional?: boolean;
  type?: () => any;
  codec?: Constructable<ICustomFieldCodec<any>>;
}

export interface IRegisterPropertyOptions {
  targetProperty: Object;
  propertyKey: string;
  MessageClass: Function;
  decoratorOptions?: IProtobufLitePropertyOptions;
}

const jsToProtobufTypesMap: { [key: string]: string } = {
  String: "string",
  Number: "int32",
  Boolean: "bool",
  Buffer: "bytes"
};

interface IFieldOptions {
  key: string;
  MessageClass: Function;
  decoratorOptions: IProtobufLitePropertyOptions;
  isArray: boolean;
}

interface IFieldInfo {
  propertyKey: string;
  prototype: any;
  rule: string;
}

export class ProtobufLiteMetadata {
  private fieldsInfo: IFieldInfo[] = [];

  private customCodecs: Array<{
    codec: ICustomFieldCodec<any>;
    propertyKey: string;
    isArray: boolean;
    isOptional: boolean;
  }> = [];

  private cachedProto: Type | null = null;

  private childTypes: Array<IFieldOptions> = [];

  constructor(private MessageClass: Function) {}

  public registerProperty({
    targetProperty,
    propertyKey,
    MessageClass,
    decoratorOptions
  }: IRegisterPropertyOptions) {
    /* istanbul ignore next line */
    if (this.cachedProto) {
      throw new Error(`Cannot register more properties once Proto is generated!`);
    }

    /* istanbul ignore next line */
    if (this.MessageClass !== MessageClass) {
      throw new Error("Tried to register property on wrong ProtobufLiteMetadata instance?");
    }

    decoratorOptions = decoratorOptions
      ? Object.assign({}, defaultProtobufLitePropertyOptions, decoratorOptions)
      : defaultProtobufLitePropertyOptions;

    let type = Reflect.getMetadata<Function>("design:type", targetProperty, propertyKey);
    let typeFromDecoratorOptions =
      decoratorOptions && decoratorOptions.type ? decoratorOptions.type() : null;

    const isArray = type === Array;
    const isSymbol = type === Symbol;

    if (isSymbol) {
      throw new Error(`Sorry Symbol is not serializable...`);
    }

    if (isArray && decoratorOptions.optional) {
      throw new Error(`Field cannot be optional and array at the same time!`);
    }

    if (isArray) {
      if (!typeFromDecoratorOptions) {
        throw new Error(`For arrays { type: () => TYPE } has to be specified in options!`);
      }

      type = typeFromDecoratorOptions;

      if (typeFromDecoratorOptions === Array) {
        throw new Error(`Nested arrays are not allowed!`);
      }
    } else {
      if (typeFromDecoratorOptions && typeFromDecoratorOptions !== type) {
        // "classProperty: ISomeInterface" <- most likely so we fallback to typeFromDecoratorOptions type
        if (type === Object) {
          type = typeFromDecoratorOptions;
        } else {
          throw new Error(
            `Type obtained from reflect metadata and { type: () => TYPE } does not match (${typeFromDecoratorOptions} !== ${type})`
          );
        }
      }
    }

    /* istanbul ignore next line */
    if (typeof type === "undefined") {
      throw new Error(`"type" cannot be undefined!`);
    }

    let isCodecUsed: boolean = false;

    const CodecConstructable = decoratorOptions.codec || InternalCodecs.lookup(type);

    if (CodecConstructable) {
      this.customCodecs.push({
        propertyKey,
        codec: new CodecConstructable(),
        isArray,
        isOptional: !!decoratorOptions.optional
      });
      isCodecUsed = true;
    }

    const isChildObj = !isCodecUsed && hasMetadataObject(type);
    const jsTypeName = isCodecUsed ? "Buffer" : type.name;
    const prototype = isChildObj ? type.name : jsToProtobufTypesMap[jsTypeName];

    if (!prototype) {
      throw new Error(`Couldn't lookup type(${jsTypeName})!`);
    }

    if (isChildObj) {
      this.childTypes.push({
        key: propertyKey,
        decoratorOptions,
        MessageClass: type,
        isArray
      });
    }

    const rule = isArray ? "repeated" : decoratorOptions.optional ? "optional" : "required";

    this.fieldsInfo.push({
      propertyKey,
      prototype,
      rule
    });
  }

  public getProto(): Type {
    if (this.cachedProto) {
      return this.cachedProto;
    }

    const className = this.getMessageClassName();
    const t = new Type(className);

    const prototypes = getPrototypeChain(this.MessageClass)
      .reverse()
      .filter(p => p !== this.MessageClass.prototype);

    let fieldIndex = 0;
    let alreadyUsedPropertyKeys: Map<string, boolean> = new Map();

    const addFields = (fields: IFieldInfo[]) => {
      for (let field of fields) {
        if (alreadyUsedPropertyKeys.has(field.propertyKey)) {
          throw new Error(`Parent class field was most likely overwrited by child class!`);
        }

        t.add(new Field(field.propertyKey, fieldIndex++, field.prototype, field.rule));

        alreadyUsedPropertyKeys.set(field.propertyKey, true);
      }
    };

    for (let prototype of prototypes) {
      const mt = getMetadataObject(prototype.constructor);
      const fields = mt.getFieldsInfo();

      addFields(fields);
    }

    addFields(this.fieldsInfo);

    for (let item of this.childTypes) {
      const metadata = getMetadataObject(item.MessageClass);
      t.add(metadata.getProto());
    }

    this.cachedProto = t;

    return t;
  }

  public fixPrototypes<T extends { [key: string]: any }>(val: T) {
    Object.setPrototypeOf(val, this.MessageClass.prototype);

    for (let item of this.childTypes) {
      const metadata = getMetadataObject(item.MessageClass);

      if (item.isArray) {
        val[item.key].forEach((it: T) => {
          metadata.fixPrototypes(it);
        });
      } else {
        if (val[item.key]) {
          metadata.fixPrototypes(val[item.key]);
        }
      }
    }
  }

  public runCustomEncoders(payload: any) {
    // optimization so copy is not done if not needed
    if (this.customCodecs.length === 0) {
      return payload;
    }

    payload = { ...payload };

    for (let { codec, propertyKey, isArray, isOptional } of this.customCodecs) {
      /* istanbul ignore next line */
      if (!codec) {
        throw new Error(`No codec?`);
      }

      if (isArray) {
        const originalArray = payload[propertyKey];
        const newArray: any = [];
        payload[propertyKey] = newArray;

        for (let index in originalArray) {
          newArray[index] = ensureBuffer(codec.encode(originalArray[index]));
        }
      } else {
        if (isOptional && !payload[propertyKey]) {
          continue;
        }

        if (!payload[propertyKey]) {
          throw new Error(`Required field was not provided.`);
        }

        payload[propertyKey] = ensureBuffer(codec.encode(payload[propertyKey]));
      }
    }

    return payload;
  }

  public runCustomDecoders(payload: any): void {
    for (let { codec, propertyKey, isArray, isOptional } of this.customCodecs) {
      /* istanbul ignore next line */
      if (!codec) {
        throw new Error("No codec?");
      }

      if (isArray) {
        for (let index in payload[propertyKey]) {
          payload[propertyKey][index] = codec.decode(ensureBuffer(payload[propertyKey][index]));
        }
      } else {
        if (isOptional && !payload[propertyKey]) {
          continue;
        }

        if (!payload[propertyKey]) {
          throw new Error(`Required field was not provided.`);
        }

        // not 100% sure why
        if (Array.isArray(payload[propertyKey]) && payload[propertyKey].length === 0) {
          continue;
        }

        payload[propertyKey] = codec.decode(ensureBuffer(payload[propertyKey]));
      }
    }
  }

  public getFieldsInfo() {
    return this.fieldsInfo;
  }

  private getMessageClassName() {
    return this.MessageClass.name;
  }
}
