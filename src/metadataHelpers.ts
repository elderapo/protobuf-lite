import { ProtobufLiteMetadata } from "./ProtobufLiteMetadata";
import { getPrototypeChain } from "./utils";

// dont use Reflect.defineMetadata because it's slow AF
let weakMap = new WeakMap<Function, ProtobufLiteMetadata>();

export const clearAllMetadata = () => {
  weakMap = new WeakMap();
};

export const getMetadataObject = (Class: Function): ProtobufLiteMetadata => {
  if (!weakMap.has(Class)) {
    weakMap.set(Class, new ProtobufLiteMetadata(Class));
  }

  return weakMap.get(Class) as ProtobufLiteMetadata;
};

export const hasMetadataObject = (Class: Function): boolean => {
  const chain = getPrototypeChain(Class);

  for (let prototype of chain) {
    if (weakMap.has(prototype.constructor)) {
      return true;
    }
  }

  return false;
};
