import { getMetadataObject } from "./metadataHelpers";
import { IProtobufLitePropertyOptions } from "./ProtobufLiteMetadata";

export const defaultProtobufLitePropertyOptions: IProtobufLitePropertyOptions = Object.freeze({
  optional: false
});

export const ProtobufLiteProperty = (decoratorOptions?: IProtobufLitePropertyOptions) => (
  targetProperty: Object,
  propertyKey: string
) => {
  const MessageClass = targetProperty.constructor;
  const metadata = getMetadataObject(MessageClass);

  decoratorOptions = decoratorOptions
    ? Object.assign({}, defaultProtobufLitePropertyOptions, decoratorOptions)
    : defaultProtobufLitePropertyOptions;

  metadata.registerProperty({
    targetProperty,
    propertyKey,
    MessageClass,
    decoratorOptions
  });
};
