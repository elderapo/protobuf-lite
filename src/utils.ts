export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Constructable<T> {
  new (): T;
}

export const getPrototypeChain = (Class: Function): Function[] => {
  let p: Function = Class.prototype;

  const prototypes: Function[] = [p];

  while (p && p.name !== "") {
    p = Object.getPrototypeOf(p);
    if (p && Object.getPrototypeOf(p)) {
      prototypes.push(p);
    }
  }

  return prototypes;
};

export const ensureBuffer = (buffer: Uint8Array | Buffer): Buffer => {
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
};
