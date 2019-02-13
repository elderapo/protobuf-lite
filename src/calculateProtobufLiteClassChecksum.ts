import * as objectHash from "object-hash";
import { getMetadataObject, hasMetadataObject } from "./metadataHelpers";
import { IFieldInfo } from "./ProtobufLiteMetadata";
import { Constructable } from "./utils";

export const getFieldInfo = (Class: Constructable<Object>): IFieldInfo[] => {
  if (!hasMetadataObject(Class)) {
    throw new Error(
      `Class(${Class}) does not have metadata assosiated with it. It's not possible to calculate checksum!`
    );
  }

  const metadataObject = getMetadataObject(Class);

  return metadataObject.getFieldsInfo();
};

export const calculateProtobufLiteClassChecksum = (Class: Constructable<Object>): string => {
  const fieldsInfo = getFieldInfo(Class);

  return objectHash(fieldsInfo);
};
