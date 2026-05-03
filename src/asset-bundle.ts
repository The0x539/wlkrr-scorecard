import { BinaryReader, Decodable } from "./decode.ts";
import * as lz4 from "@denosaurs/lz4";

export class BundleHeader extends Decodable {
  signature = this.r.string(); // "UnityFS"
  fileVersion = this.r.u32();
  minPlayerVersion = this.r.string();
  fileEngineVersion = this.r.string();
  archiveSize = this.r.u64();
  infoBlockCompressedSize = this.r.u32();
  infoBlockSize = this.r.u32();
  flags = this.r.u32();

  compressionMode = this.flags & 0x3F;
  hasDirectoryInfo = !!(this.flags & 0x40);
  infoBlockAtEnd = !!(this.flags & 0x80);
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
  filepath = new TextDecoder().decode(this.r.bytes(37)).replace(/\0+$/, "");
}

export class BundleFile {
  header: BundleHeader;
  infoBlock: BundleInfoBlock;

  private readonly data: BinaryReader;
  private readonly dataStart: number;
  private readonly alignedBlocks: boolean;

  constructor(r: BinaryReader) {
    r.littleEndian = false;
    this.data = r;
    this.header = new BundleHeader(r);

    this.alignedBlocks = this.header.fileVersion >= 7;
    this.dataStart = r.pos();

    let infoBlockData: Uint8Array<ArrayBuffer>;
    if (this.header.infoBlockAtEnd) {
      r.seek(-this.header.infoBlockCompressedSize);
    }
    infoBlockData = r.bytes(this.header.infoBlockCompressedSize);
    if (this.header.infoBlockAtEnd) {
      r.seek(this.dataStart);
    }

    if (this.alignedBlocks) {
      r.align(16);
    }

    const mode = this.header.compressionMode;
    if (mode === 2 || mode === 3) {
      infoBlockData = lz4.decompress(infoBlockData) as Uint8Array<ArrayBuffer>;
    }

    const infoBlockReader = new BinaryReader(infoBlockData.buffer);
    this.infoBlock = new BundleInfoBlock(infoBlockReader, r.littleEndian);
  }

  getFile(index: number): Uint8Array<ArrayBuffer> {
    const metadata = this.infoBlock.paths[index];
    const data = new Uint8Array(metadata.uncompressedSize);

    this.data.seek(this.dataStart);
    if (this.alignedBlocks) {
      this.data.align(16);
    }

    let i = 0, j = 0;
    // TODO: For files other than the first, seek to the appropriate position in the block list.
    // The only bundle I'm working with and can manage to successfully parse only has one file in it.

    for (; j < metadata.uncompressedSize; i++) {
      const blockInfo = this.infoBlock.blocks[i];

      const compressedBlock = this.data.bytes(blockInfo.compressedSize);
      const block = lz4.decompress(compressedBlock);
      data.set(block, j);
      j += blockInfo.uncompressedSize;
    }

    return data;
  }
}

export class AssetHeader {
  metadataSize: number;
  fileSize: number;
  version: number;
  dataOffset: number;

  constructor(r: BinaryReader) {
    r.littleEndian = false;
    this.metadataSize = r.u32();
    this.fileSize = r.u32();
    this.version = r.u32();
    this.dataOffset = r.u32();
  }
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
    const r = new BinaryReader(buf, false);

    const h = this.header = new AssetHeader(r);

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
      (r) => new SerializedType(r, h.version, this.enableTypeTree),
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

  constructor(
    r: BinaryReader,
    version: number,
    enableTypeTree: boolean,
  ) {
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

      this.typeTree = { tree: new TypeTree(r, version), deps: [] };

      if (version >= 21) {
        this.typeTree.deps = r.array(r.i32(), r.i32);
      }
    }
  }
}

export class TypeTree {
  nodes: TypeTreeNode[];
  stringBuffer = new ArrayBuffer(0);

  constructor(r: BinaryReader, version: number) {
    const nodeCount = r.i32();
    const stringBufferSize = r.i32();

    this.nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const node = new TypeTreeNode(r, version);
      this.nodes.push(node);
    }

    const stringBuffer = r.bytes(stringBufferSize);
    function readString(offset: number): string {
      if (offset >= 0) {
        const end = stringBuffer.indexOf(0, offset);
        const bytes = stringBuffer.slice(offset, end);
        return new TextDecoder().decode(bytes);
      } else {
        return "todo";
      }
    }

    for (const node of this.nodes) {
      node.type = readString(node.typeStrOffset);
      node.name = readString(node.nameStrOffset);
    }
  }
}

export class TypeTreeNode {
  version: number;
  level: number;
  typeFlag: number;
  typeStrOffset: number;
  nameStrOffset: number;
  size: number;
  index: number;
  metaFlag: number;
  type: string;
  name: string;
  refTypeHash: bigint | null = null;

  constructor(r: BinaryReader, version: number) {
    this.version = r.u16();
    this.level = r.u8();
    this.typeFlag = r.u8();
    this.typeStrOffset = r.u32();
    this.nameStrOffset = r.u32();
    this.size = r.i32();
    this.index = r.i32();
    this.metaFlag = r.i32();
    this.type = "";
    this.name = "";

    if (version >= 19) this.refTypeHash = r.big_u64();
  }
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
    return new BinaryReader(chunk, false);
  }
}
