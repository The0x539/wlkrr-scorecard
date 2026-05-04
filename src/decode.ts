export class BinaryReader<T extends ArrayBufferLike = ArrayBuffer>
  extends DataView<T> {
  private i = 0;
  littleEndian = true;
  version = 0;

  constructor(buffer: T) {
    super(buffer);
  }

  pos(): number {
    return this.i;
  }

  seek(pos: number): void {
    if (pos < 0) {
      pos = this.byteLength + pos;
    }
    this.i = pos;
  }

  skip(len: number = 1): void {
    this.i += len;
  }

  align(size: number): void {
    while (this.i % size !== 0) this.i++;
  }

  i8(): number {
    const v = this.getInt8(this.i);
    this.i += 1;
    return v;
  }

  i16(): number {
    const v = this.getInt16(this.i, this.littleEndian);
    this.i += 2;
    return v;
  }

  i32(): number {
    const v = this.getInt32(this.i, this.littleEndian);
    this.i += 4;
    return v;
  }

  i64(): number {
    return Number(this.big_i64());
  }

  big_i64(): bigint {
    const v = this.getBigInt64(this.i, this.littleEndian);
    this.i += 8;
    return v;
  }

  u16(): number {
    const v = this.getUint16(this.i, this.littleEndian);
    this.i += 2;
    return v;
  }

  u32(): number {
    const v = this.getUint32(this.i, this.littleEndian);
    this.i += 4;
    return v;
  }

  u64(): number {
    return Number(this.big_u64());
  }

  big_u64(): bigint {
    const v = this.getBigUint64(this.i, this.littleEndian);
    this.i += 8;
    return v;
  }

  f32(): number {
    const v = this.getFloat32(this.i, this.littleEndian);
    this.i += 4;
    return v;
  }

  u8(): number {
    const v = this.getUint8(this.i);
    this.i += 1;
    return v;
  }

  bool(): boolean {
    const v = this.getUint8(this.i);
    this.i += 1;
    return v !== 0;
  }

  bool32(): boolean {
    const v = this.bool();
    this.i += 3;
    return v;
  }

  pair<T>(f: (r: typeof this) => T): [T, T] {
    f = f.bind(this);
    return [f(this), f(this)];
  }

  triple<T>(f: (r: typeof this) => T): [T, T, T] {
    f = f.bind(this);
    return [f(this), f(this), f(this)];
  }

  array<T>(len: number, f: (r: typeof this) => T): T[] {
    f = f.bind(this);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(f(this));
    }
    return arr;
  }

  bytes(len: number): Uint8Array<T> {
    const buffer: T = this.buffer;
    const v: T = this.buffer.slice(this.i, this.i + len) as T;
    console.assert(buffer.constructor === v.constructor);

    this.i += len;
    return new Uint8Array(v);
  }

  string(len: number | null = null): string {
    const terminated = len === null;

    if (len === null) {
      for (len = 0; len < 0x100; len++) {
        if (this.getUint8(this.i + len) === 0) {
          break;
        }
      }
    }

    const bytes = this.bytes(len);
    if (terminated) this.skip();

    return new TextDecoder("utf-8").decode(bytes);
  }

  paddedString(): string {
    const len = this.u32();
    const s = this.string(len);
    this.align(4);
    return s;
  }

  remainder(): T {
    return this.buffer.slice(this.i) as T;
  }
}

// keep outside the map to hide from the object inspection in console for cleanliness
const readers = new WeakMap<Decodable, BinaryReader>();

export abstract class Decodable {
  protected get r(): BinaryReader {
    return readers.get(this)!;
  }

  constructor(
    data: ArrayBuffer | BinaryReader,
    littleEndian: boolean | null = null,
  ) {
    if (!(data instanceof BinaryReader)) {
      data = new BinaryReader(data);
    }

    if (littleEndian !== null) {
      data.littleEndian = littleEndian;
    }

    readers.set(this, data);
  }
}
