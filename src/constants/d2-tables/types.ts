export type BaseItemTable = "armor" | "weapons" | "misc";

export interface BaseItem {
  table: BaseItemTable;
  name: string;
  code: string;
  type: string | null;
  level: number;
  rarity: number;
  spawnable: boolean;
}

export interface ItemTypeRecord {
  name: string;
  code: string;
  equiv1: string | null;
  equiv2: string | null;
  rarity: number | null;
  /** True when this type generates automatic treasure classes such as `armo87`. */
  generatesTreasureClass: boolean;
}

export interface ItemRawProp {
  prop: string;
  min?: number;
  max?: number;
  par?: number;
}

export interface UniqueItemDrop {
  name: string;
  baseCode: string;
  baseName: string | null;
  rarity: number;
  level: number;
  levelRequirement: number;
  spawnable: boolean;
  rawProps: ItemRawProp[];
}

export interface SetItemDrop {
  name: string;
  setName: string | null;
  baseCode: string;
  baseName: string | null;
  rarity: number;
  level: number;
  levelRequirement: number;
  spawnable: boolean;
}

export interface ItemRatioRecord {
  version: number;
  uber: boolean;
  classSpecific: boolean;
  unique: number;
  uniqueDivisor: number;
  uniqueMin: number;
  set: number;
  setDivisor: number;
  setMin: number;
  rare: number;
  rareDivisor: number;
  rareMin: number;
  magic: number;
  magicDivisor: number;
  magicMin: number;
}

/** Where one Treasure Class entry points. The roll engine comes later. */
export type DropToken =
  | { kind: "treasureClass"; name: string }
  | { kind: "baseItem"; code: string; table: BaseItemTable }
  | { kind: "itemType"; code: string; level: number }
  | { kind: "uniqueItem"; name: string; baseCode: string }
  | { kind: "gold"; multiplier: number | null }
  | { kind: "unresolved"; token: string };

export interface TreasureClassEntry {
  token: string;
  probability: number;
  target: DropToken;
}

export interface TreasureClassView {
  name: string;
  group: number | null;
  level: number | null;
  picks: number;
  /** Absent in the file means 0. Players X adjusts this later. */
  noDrop: number;
  /** Null means the row does not override itemratio.txt. */
  unique: number | null;
  set: number | null;
  rare: number | null;
  magic: number | null;
  entries: TreasureClassEntry[];
}

export interface SuperUniqueDrop {
  name: string;
  monsterClass: string | null;
  treasureClass: {
    normal: string | null;
    nightmare: string | null;
    hell: string | null;
    hellDesecrated: string | null;
  };
}

export interface D2TableCounts {
  treasureClasses: number;
  baseItems: number;
  itemTypes: number;
  uniqueItems: number;
  setItems: number;
  itemRatios: number;
  superUniques: number;
}
