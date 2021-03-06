import { ICustomFieldCodec } from "./ICustomFieldCodec";

export class DateCodec implements ICustomFieldCodec<Date> {
  public encode(date: Date) {
    const b = Buffer.alloc(8);
    b.writeUIntLE(date.getTime(), 0, 6);

    return b;
  }

  public decode(buffer: Buffer): Date {
    const utcTimestamp = buffer.readUIntLE(0, 6);

    return new Date(utcTimestamp);
  }
}
