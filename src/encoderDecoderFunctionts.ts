import { Message } from "protobufjs/light";
import { getMetadataObject, hasMetadataObject } from "./metadataHelpers";
import { ensureBuffer } from "./utils";

export const encode = <T>(MessageClass: new () => T, payload: T): Buffer => {
  if (!payload) {
    throw new Error(`Payload wasnt provided!`);
  }

  if (!hasMetadataObject(MessageClass)) {
    throw new Error(`MessageClass doesn't have protobuf lite metadata assosiated!`);
  }

  const metadataObject = getMetadataObject(MessageClass);
  const MessageClassProto = metadataObject.getProto();

  payload = metadataObject.runCustomEncoders(payload);

  const errMsg = MessageClassProto.verify(payload);

  if (errMsg) {
    throw new Error(errMsg);
  }

  return ensureBuffer(MessageClassProto.encode(payload).finish());
};

export const decode = <T extends Object>(MessageClass: new () => T, encoded: Buffer): T => {
  if (!hasMetadataObject(MessageClass)) {
    throw new Error(`MessageClass doesn't have protobuf lite metadata assosiated!`);
  }

  const metadataObject = getMetadataObject(MessageClass);
  const MessageClassProto = metadataObject.getProto();

  const decoded: Message<T> = MessageClassProto.decode(encoded);

  metadataObject.runCustomDecoders(decoded);
  metadataObject.fixPrototypes(decoded);

  return (decoded as unknown) as T;
};
