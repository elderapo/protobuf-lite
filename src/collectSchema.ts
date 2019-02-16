import { getMetadataObject, hasMetadataObject } from "./metadataHelpers";
import { IFieldInfo, IFieldOptions, ProtobufLiteMetadata } from "./ProtobufLiteMetadata";
import { getPrototypeChain, Omit } from "./utils";

export type FieldInfoWithoutPropertyKey = Omit<IFieldInfo, "propertyKey">;

export interface ISchema {
  refs: FieldInfoWithoutPropertyKey[][];
  fieldsInfo: FieldInfoWithoutPropertyKey[];
}

export const collectSchema = (MessageClass: Function): ISchema => {
  /* istanbul ignore next line */
  if (!hasMetadataObject(MessageClass)) {
    throw new Error(`MessageClass doesn't have protobuf lite metadata assosiated!`);
  }

  const metadata = getMetadataObject(MessageClass);

  const schema: ISchema = {
    refs: [],
    fieldsInfo: []
  };

  const mapField = (fieldInfo: IFieldInfo): FieldInfoWithoutPropertyKey => {
    if (childTypesByClassName.has(fieldInfo.prototype)) {
      const fieldOptions = childTypesByClassName.get(fieldInfo.prototype) as IFieldOptions;
      const indexRef = indexedChildTypes.indexOf(fieldOptions);

      return { prototype: `__ref__${indexRef}__`, rule: fieldInfo.rule };
    }

    return { prototype: fieldInfo.prototype, rule: fieldInfo.rule };
  };

  const childTypesByClassName = new Map<string, IFieldOptions>();
  const indexedChildTypes: IFieldOptions[] = [];

  const collectChildTypes = (childTypes: IFieldOptions[]) => {
    for (let item of childTypes) {
      const metadata = getMetadataObject(item.MessageClass);

      if (!childTypesByClassName.has(metadata.getMessageClassName())) {
        childTypesByClassName.set(metadata.getMessageClassName(), item);
        indexedChildTypes.push(item);

        if (metadata.getChildTypes()) {
          collectChildTypes(metadata.getChildTypes());
        }
      }
    }
  };

  collectChildTypes(metadata.getChildTypes());

  const alreadyCollectedChildTypes = new Map<ProtobufLiteMetadata, boolean>();

  const handleChildTypes = (childTypes: IFieldOptions[]) => {
    for (let item of childTypes) {
      const metadata = getMetadataObject(item.MessageClass);

      if (alreadyCollectedChildTypes.has(metadata)) {
        continue;
      }
      alreadyCollectedChildTypes.set(metadata, true);

      schema.refs.push(metadata.getFieldsInfo().map(mapField));

      if (metadata.getChildTypes()) {
        handleChildTypes(metadata.getChildTypes());
      }
    }
  };

  handleChildTypes(metadata.getChildTypes());

  // const MessageClass = metadata.getMessageClass();
  const prototypes = getPrototypeChain(MessageClass)
    .reverse()
    .filter(p => p !== MessageClass.prototype);

  const alreadyUsedPropertyKeys: Map<string, boolean> = new Map();

  const addFields = (fields: IFieldInfo[]) => {
    for (let field of fields) {
      if (alreadyUsedPropertyKeys.has(field.propertyKey)) {
        throw new Error(`Parent class field was most likely overwrited by child class!`);
      }

      schema.fieldsInfo.push(mapField(field));

      alreadyUsedPropertyKeys.set(field.propertyKey, true);
    }
  };

  for (let prototype of prototypes) {
    const mt = getMetadataObject(prototype.constructor);
    const fields = mt.getFieldsInfo();

    addFields(fields);
  }

  addFields(metadata.getFieldsInfo());

  return schema;
};
