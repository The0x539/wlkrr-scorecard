import { BinaryReader, Decodable } from "./decode.ts";
import * as lz4 from "@denosaurs/lz4";
import { commonStrings } from "./unity-asset/common-strings.ts";

export class BundleHeader extends Decodable {
  signature = this.r.string(); // "UnityFS"
  fileVersion = this.r.u32();
  minPlayerVersion = this.r.string();
  fileEngineVersion = this.r.string();
  archiveSize = this.r.u64();
  infoBlockCompressedSize = this.r.u32();
  infoBlockSize = this.r.u32();

  flags = (() => {
    const raw = this.r.u32();
    return {
      raw,
      compressionMode: raw & 0x3F,
      hasDirectoryInfo: !!(raw & 0x40),
      infoBlockAtEnd: !!(raw & 0x80),
      oldWebPluginCompat: !!(raw & 0x100),
      blockInfoNeedPaddingAtStart: !!(raw & 0x200),
    };
  })();

  private getHeaderEnd(): number {
    let pos = this.minPlayerVersion.length + this.fileEngineVersion.length;
    pos += 0x1a;

    if (this.flags.oldWebPluginCompat) {
      pos += 0x0a;
    } else {
      pos += this.signature.length + 1;
    }

    if (this.fileVersion >= 7) {
      while (pos % 16 !== 0) pos++;
    }

    return pos;
  }

  getInfoBlockOffset(): number {
    if (this.flags.infoBlockAtEnd) {
      return -this.infoBlockCompressedSize;
    } else {
      return this.getHeaderEnd();
    }
  }

  getFileDataOffset(): number {
    let pos = this.getHeaderEnd();

    if (!this.flags.infoBlockAtEnd) {
      pos += this.infoBlockCompressedSize;
    }

    if (this.flags.blockInfoNeedPaddingAtStart) {
      while (pos % 16 !== 0) pos++;
    }

    return pos;
  }
}

export class BundleInfoBlock extends Decodable {
  hash = this.r.bytes(16);
  blocks = this.r.array(this.r.u32(), (r) => new BlockInfo(r));
  paths = this.r.array(this.r.u32(), (r) => new PathInfo(r));
}

export class BlockInfo extends Decodable {
  uncompressedSize = this.r.u32();
  compressedSize = this.r.u32();
  flags = this.r.u16();
}

export class PathInfo extends Decodable {
  location = this.r.u64();
  uncompressedSize = this.r.u64();
  flags = this.r.u32();
  filepath = this.r.string();
}

export class BundleFile {
  header: BundleHeader;
  infoBlock: BundleInfoBlock;

  private readonly data: BinaryReader;

  constructor(r: BinaryReader) {
    r.littleEndian = false;
    this.data = r;
    this.header = new BundleHeader(r);
    r.version = this.header.fileVersion;
    this.alignBlock();

    r.seek(this.header.getInfoBlockOffset());
    let infoBlockData = r.bytes(this.header.infoBlockCompressedSize);

    const mode = this.header.flags.compressionMode;
    if (mode === 2 || mode === 3) {
      infoBlockData = lz4.decompress(infoBlockData) as Uint8Array<ArrayBuffer>;
    }

    const infoBlockReader = new BinaryReader(infoBlockData.buffer);
    this.infoBlock = new BundleInfoBlock(infoBlockReader, r.littleEndian);
  }

  getFile(index: number): Uint8Array<ArrayBuffer> {
    const metadata = this.infoBlock.paths[index];
    const data = new Uint8Array(metadata.uncompressedSize);

    this.data.seek(this.header.getFileDataOffset());

    let srcPos = 0, blockIdx = 0, dstPos = 0;

    while (dstPos < metadata.uncompressedSize) {
      const blockInfo = this.infoBlock.blocks[blockIdx];
      const blockEnd = srcPos + blockInfo.uncompressedSize;

      if (blockEnd <= metadata.location) {
        this.data.skip(blockInfo.compressedSize);
        blockIdx += 1;
        srcPos = blockEnd;
        continue;
      }

      let blockData = this.data.bytes(blockInfo.compressedSize);
      blockData = lz4.decompress(blockData) as Uint8Array<ArrayBuffer>;
      console.assert(blockData.length === blockInfo.uncompressedSize);

      const start = metadata.location + dstPos - srcPos;
      const desiredLength = metadata.uncompressedSize - dstPos;
      const end = Math.min(blockData.length, start + desiredLength);
      const chunk = blockData.slice(start, end);

      data.set(chunk, dstPos);
      dstPos += chunk.length;

      blockIdx += 1;
      srcPos = blockEnd;
    }

    return data;
  }

  private alignBlock(): void {
    if (this.header.fileVersion >= 7) {
      this.data.align(16);
    }
  }
}

export class AssetHeader extends Decodable {
  metadataSize = this.r.u32();
  fileSize = this.r.u32();
  version = this.r.u32();
  dataOffset = this.r.u32();
}

export class Asset {
  header: AssetHeader;
  bigEndian: boolean;
  unityVersion: string = "";
  targetPlatform: number = 0;
  enableTypeTree: boolean = false;
  types: SerializedType[] = [];
  typeMap: Map<number, SerializedType> = new Map();
  enableBigID: boolean = false;
  objectInfos: ObjectInfo[] = [];

  constructor(readonly buf: ArrayBuffer) {
    const r = new BinaryReader(buf);
    r.littleEndian = false;

    const h = this.header = new AssetHeader(r);
    r.version = h.version;

    if (h.version >= 9) {
      this.bigEndian = r.bool32(); // looks to be big-endian for this game
    } else {
      r.seek(h.fileSize - h.metadataSize);
      this.bigEndian = r.bool();
    }

    if (h.version >= 22) {
      h.metadataSize = r.u32();
      h.fileSize = r.u64();
      h.dataOffset = r.u64();
      r.skip(8);
    }
    r.littleEndian = !this.bigEndian;

    if (h.version >= 7) this.unityVersion = r.string();
    if (h.version >= 8) this.targetPlatform = r.i32();
    if (h.version >= 13) this.enableTypeTree = r.bool();

    this.types = r.array(
      r.i32(),
      (r) => new SerializedType(r, this.enableTypeTree),
    );
    for (const ty of this.types) this.typeMap.set(ty.classID, ty);

    if (h.version >= 7 && h.version < 14) this.enableBigID = r.i32() != 0;

    this.objectInfos = r.array(r.u32(), (r) => new ObjectInfo(r, this));
  }
}

export class SerializedType {
  classID: number;
  isStrippedType: boolean = false;
  scriptTypeIndex: number | null = null;
  scriptID: Uint8Array = new Uint8Array();
  oldTypeHash: Uint8Array = new Uint8Array();

  typeTree: {
    tree: TypeTree;
    deps: number[];
  } | null = null;

  constructor(r: BinaryReader, enableTypeTree: boolean) {
    const version = r.version;
    this.classID = r.i32();

    if (version >= 16) this.isStrippedType = r.bool();
    if (version >= 17) this.scriptTypeIndex = r.i16();

    if (version >= 13) {
      const a = version < 16 && this.classID < 0;
      const b = version >= 16 && this.classID === 114;
      if (a || b) {
        this.scriptID = r.bytes(16);
      }
      this.oldTypeHash = r.bytes(16);
    }

    if (enableTypeTree) {
      if (!(version >= 12 || version === 10)) {
        throw new Error(`Unsupported asset version: ${version}`);
      }

      this.typeTree = { tree: new TypeTree(r), deps: [] };

      if (version >= 21) {
        this.typeTree.deps = r.array(r.i32(), r.i32);
      }
    }
  }
}

export class TypeTree {
  nodes: TypeTreeNode[];
  stringBuffer = new ArrayBuffer(0);

  constructor(r: BinaryReader) {
    const nodeCount = r.i32();
    const stringBufferSize = r.i32();

    this.nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const node = new TypeTreeNode(r);
      this.nodes.push(node);
    }

    const stringBuffer = r.bytes(stringBufferSize);
    function readString(id: TypeStrId): string {
      if (id.custom) {
        const end = stringBuffer.indexOf(0, id.offset);
        const bytes = stringBuffer.slice(id.offset, end);
        return new TextDecoder().decode(bytes);
      } else {
        return commonStrings.get(id.idx)!;
      }
    }

    for (const node of this.nodes) {
      node.type = readString(node.typeStr);
      node.name = readString(node.nameStr);
    }
  }
}

export type TypeStrId = { custom: false; idx: number } | {
  custom: true;
  offset: number;
};

const typeStr = (r: BinaryReader): TypeStrId => {
  const n = r.u32();
  const flag = 0x8000_0000;
  if (n & flag) {
    return { custom: false, idx: n & ~flag };
  } else {
    return { custom: true, offset: n };
  }
};

export class TypeTreeNode extends Decodable {
  version = this.r.u16();
  level = this.r.u8();
  typeFlag = this.r.u8();
  typeStr = typeStr(this.r);
  nameStr = typeStr(this.r);
  size = this.r.i32();
  index = this.r.i32();
  metaFlag = this.r.i32();
  refTypeHash: bigint | null = this.r.version >= 19 ? this.r.big_u64() : null;
  type = "";
  name = "";
}

export class ObjectInfo {
  pathID: bigint;
  bytesStart: number;
  bytesSize: number;
  typeID: number;
  classID: number;
  serializedType: SerializedType;
  isDestroyed: number | null = null;
  stripped: number | null = null;

  version: number; // not stored in the serialization, just here for convenience

  constructor(r: BinaryReader, asset: Asset) {
    const version = this.version = asset.header.version;

    if (asset.enableBigID) {
      this.pathID = r.big_i64();
    } else if (version < 14) {
      this.pathID = BigInt(r.i32());
    } else {
      r.align(4);
      this.pathID = r.big_i64();
    }

    this.bytesStart = version >= 22 ? r.u64() : r.u32();
    this.bytesStart += asset.header.dataOffset;
    this.bytesSize = r.u32();
    this.typeID = r.i32();

    if (version < 16) {
      this.classID = r.u16();
      this.serializedType = asset.typeMap.get(this.typeID)!;
    } else {
      this.classID = asset.types[this.typeID].classID;
      this.serializedType = asset.types[this.typeID];
    }

    if (version < 11) this.isDestroyed = r.u16();

    if (version >= 11 && version < 17) {
      const scriptTypeIndex = r.u16();
      if (this.serializedType) {
        this.serializedType.scriptTypeIndex = scriptTypeIndex;
      }
    }

    if (version === 15 || version === 16) this.stripped = r.u8();
  }

  getReader<T extends ArrayBufferLike>(buf: T): BinaryReader<T> {
    const start = this.bytesStart;
    const end = start + this.bytesSize;
    const chunk = buf.slice(start, end) as T;
    console.assert(chunk.constructor === buf.constructor);
    const reader = new BinaryReader(chunk);
    reader.version = this.version;
    return reader;
  }
}
