import "server-only";
import { createRequire } from "node:module";

import type {
  BaseItem,
  BaseItemTable,
  D2TableCounts,
  DropToken,
  ItemRatioRecord,
  ItemTypeRecord,
  SetItemDrop,
  SuperUniqueDrop,
  TreasureClassEntry,
  TreasureClassView,
  UniqueItemDrop,
  ItemRawProp,
} from "./types";

const requireJson = createRequire(import.meta.url);

const ITEM_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

interface Tables {
  treasureClasses: Map<string, TreasureClassView>;
  baseItems: Map<string, BaseItem>;
  itemTypes: Map<string, ItemTypeRecord>;
  uniquesByBase: Map<string, UniqueItemDrop[]>;
  uniquesByName: Map<string, UniqueItemDrop>;
  setsByBase: Map<string, SetItemDrop[]>;
  itemRatios: ItemRatioRecord[];
  superUniques: Map<string, SuperUniqueDrop>;
  counts: D2TableCounts;
}

let tables: Tables | null = null;

function asTable(fileName: string, value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`d2 table ${fileName} is not an object`);
  }
  return value as Record<string, unknown>;
}

const RAW_TABLES = {
  "treasureclassex.json": () => asTable("treasureclassex.json", requireJson("./treasureclassex.json")),
  "itemtypes.json": () => asTable("itemtypes.json", requireJson("./itemtypes.json")),
  "armor.json": () => asTable("armor.json", requireJson("./armor.json")),
  "weapons.json": () => asTable("weapons.json", requireJson("./weapons.json")),
  "misc.json": () => asTable("misc.json", requireJson("./misc.json")),
  "uniqueitems.json": () => asTable("uniqueitems.json", requireJson("./uniqueitems.json")),
  "setitems.json": () => asTable("setitems.json", requireJson("./setitems.json")),
  "itemratio.json": () => asTable("itemratio.json", requireJson("./itemratio.json")),
  "superuniques.json": () => asTable("superuniques.json", requireJson("./superuniques.json")),
} as const;

function loadTable(fileName: keyof typeof RAW_TABLES): Record<string, unknown> {
  return RAW_TABLES[fileName]();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNumber(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requireNumber(row: Record<string, unknown>, key: string, label: string): number {
  const value = readNumber(row, key);
  if (value === null) {
    throw new Error(`d2 table row ${label} is missing numeric ${key}`);
  }
  return value;
}

function readRows(fileName: keyof typeof RAW_TABLES): Record<string, unknown>[] {
  return Object.values(loadTable(fileName)).filter(isRecord);
}

function loadBaseItems(
  fileName: keyof typeof RAW_TABLES,
  table: BaseItemTable,
  into: Map<string, BaseItem>,
) {
  for (const row of readRows(fileName)) {
    const code = readString(row, "code");
    const name = readString(row, "name");
    if (!code || !name) continue;
    into.set(code, {
      table,
      name,
      code,
      type: readString(row, "type"),
      level: readNumber(row, "level") ?? 0,
      rarity: readNumber(row, "rarity") ?? 0,
      spawnable: readNumber(row, "spawnable") !== 0,
    });
  }
}

function loadItemTypes(): Map<string, ItemTypeRecord> {
  const itemTypes = new Map<string, ItemTypeRecord>();
  for (const row of readRows("itemtypes.json")) {
    const code = readString(row, "Code");
    const name = readString(row, "ItemType");
    if (!code || !name) continue;
    itemTypes.set(code, {
      name,
      code,
      equiv1: readString(row, "Equiv1"),
      equiv2: readString(row, "Equiv2"),
      rarity: readNumber(row, "Rarity"),
      generatesTreasureClass: readNumber(row, "TreasureClass") === 1,
    });
  }
  return itemTypes;
}

function loadUniqueItems(): { byBase: Map<string, UniqueItemDrop[]>; byName: Map<string, UniqueItemDrop> } {
  const byBase = new Map<string, UniqueItemDrop[]>();
  const byName = new Map<string, UniqueItemDrop>();
  for (const row of readRows("uniqueitems.json")) {
    const name = readString(row, "index");
    const baseCode = readString(row, "code");
    if (!name || !baseCode) continue;

    const rawProps: ItemRawProp[] = [];
    for (let i = 1; i <= 12; i++) {
      const prop = readString(row, `prop${i}`);
      if (prop) {
        const min = readNumber(row, `min${i}`);
        const max = readNumber(row, `max${i}`);
        const par = readNumber(row, `par${i}`);
        const rawProp: ItemRawProp = { prop };
        if (min !== null) rawProp.min = min;
        if (max !== null) rawProp.max = max;
        if (par !== null) rawProp.par = par;
        rawProps.push(rawProp);
      }
    }

    const item: UniqueItemDrop = {
      name,
      baseCode,
      baseName: readString(row, "*ItemName"),
      rarity: readNumber(row, "rarity") ?? 0,
      level: readNumber(row, "lvl") ?? 0,
      levelRequirement: readNumber(row, "lvl req") ?? 0,
      spawnable: readNumber(row, "spawnable") !== 0,
      rawProps,
    };
    const bucket = byBase.get(baseCode) ?? [];
    bucket.push(item);
    byBase.set(baseCode, bucket);
    byName.set(name, item);
  }
  return { byBase, byName };
}

function loadSetItems(): Map<string, SetItemDrop[]> {
  const byBase = new Map<string, SetItemDrop[]>();
  for (const row of readRows("setitems.json")) {
    const name = readString(row, "index");
    const baseCode = readString(row, "item");
    if (!name || !baseCode) continue;
    const item: SetItemDrop = {
      name,
      setName: readString(row, "set"),
      baseCode,
      baseName: readString(row, "*ItemName"),
      rarity: readNumber(row, "rarity") ?? 0,
      level: readNumber(row, "lvl") ?? 0,
      levelRequirement: readNumber(row, "lvl req") ?? 0,
      spawnable: readNumber(row, "spawnable") !== 0,
    };
    const bucket = byBase.get(baseCode) ?? [];
    bucket.push(item);
    byBase.set(baseCode, bucket);
  }
  return byBase;
}

function loadItemRatios(): ItemRatioRecord[] {
  return readRows("itemratio.json").map((row) => ({
    version: requireNumber(row, "Version", "itemratio"),
    uber: readNumber(row, "Uber") === 1,
    classSpecific: readNumber(row, "Class Specific") === 1,
    unique: requireNumber(row, "Unique", "itemratio"),
    uniqueDivisor: requireNumber(row, "UniqueDivisor", "itemratio"),
    uniqueMin: requireNumber(row, "UniqueMin", "itemratio"),
    set: requireNumber(row, "Set", "itemratio"),
    setDivisor: requireNumber(row, "SetDivisor", "itemratio"),
    setMin: requireNumber(row, "SetMin", "itemratio"),
    rare: requireNumber(row, "Rare", "itemratio"),
    rareDivisor: requireNumber(row, "RareDivisor", "itemratio"),
    rareMin: requireNumber(row, "RareMin", "itemratio"),
    magic: requireNumber(row, "Magic", "itemratio"),
    magicDivisor: requireNumber(row, "MagicDivisor", "itemratio"),
    magicMin: requireNumber(row, "MagicMin", "itemratio"),
  }));
}

function loadSuperUniques(): Map<string, SuperUniqueDrop> {
  const superUniques = new Map<string, SuperUniqueDrop>();
  for (const row of readRows("superuniques.json")) {
    const name = readString(row, "Superunique");
    if (!name) continue;
    superUniques.set(name, {
      name,
      monsterClass: readString(row, "Class"),
      treasureClass: {
        normal: readString(row, "TC"),
        nightmare: readString(row, "TC(N)"),
        hell: readString(row, "TC(H)"),
        hellDesecrated: readString(row, "TC(H) Desecrated"),
      },
    });
  }
  return superUniques;
}

function classifyGold(token: string): Extract<DropToken, { kind: "gold" }> | null {
  const stripped = token.replaceAll('"', "");
  if (stripped === "gld") return { kind: "gold", multiplier: null };
  const match = /^gld,mul=(\d+)$/.exec(stripped);
  if (!match) return null;
  return { kind: "gold", multiplier: Number(match[1]) };
}

function classifyItemType(token: string, itemTypes: Map<string, ItemTypeRecord>): DropToken | null {
  const match = /^([A-Za-z]+)(\d+)$/.exec(token);
  if (!match) return null;
  const code = match[1];
  if (!code || !itemTypes.has(code)) return null;
  return { kind: "itemType", code, level: Number(match[2]) };
}

function createClassifier(loaded: Omit<Tables, "treasureClasses" | "counts">) {
  return function classifyDropToken(token: string): DropToken {
    if (loaded.baseItems.has(token)) {
      const item = loaded.baseItems.get(token);
      if (item) return { kind: "baseItem", code: item.code, table: item.table };
    }
    const gold = classifyGold(token);
    if (gold) return gold;
    const itemType = classifyItemType(token, loaded.itemTypes);
    if (itemType) return itemType;
    const unique = loaded.uniquesByName.get(token);
    if (unique) return { kind: "uniqueItem", name: unique.name, baseCode: unique.baseCode };
    return { kind: "unresolved", token };
  };
}

function loadTreasureClasses(classify: (token: string) => DropToken): Map<string, TreasureClassView> {
  const rows = loadTable("treasureclassex.json");
  const names = new Set(Object.keys(rows));
  const treasureClasses = new Map<string, TreasureClassView>();

  for (const [name, value] of Object.entries(rows)) {
    if (!isRecord(value)) continue;
    const entries: TreasureClassEntry[] = [];
    for (const slot of ITEM_SLOTS) {
      const token = readString(value, `Item${slot}`);
      if (!token) continue;
      const target = names.has(token) ? { kind: "treasureClass" as const, name: token } : classify(token);
      entries.push({
        token,
        probability: readNumber(value, `Prob${slot}`) ?? 0,
        target,
      });
    }
    treasureClasses.set(name, {
      name,
      group: readNumber(value, "group"),
      level: readNumber(value, "level"),
      picks: readNumber(value, "Picks") ?? 0,
      noDrop: readNumber(value, "NoDrop") ?? 0,
      unique: readNumber(value, "Unique"),
      set: readNumber(value, "Set"),
      rare: readNumber(value, "Rare"),
      magic: readNumber(value, "Magic"),
      entries,
    });
  }

  return treasureClasses;
}

function loadTables(): Tables {
  const baseItems = new Map<string, BaseItem>();
  loadBaseItems("armor.json", "armor", baseItems);
  loadBaseItems("weapons.json", "weapons", baseItems);
  loadBaseItems("misc.json", "misc", baseItems);

  const itemTypes = loadItemTypes();
  const uniques = loadUniqueItems();
  const setsByBase = loadSetItems();
  const itemRatios = loadItemRatios();
  const superUniques = loadSuperUniques();
  const classify = createClassifier({
    baseItems,
    itemTypes,
    uniquesByBase: uniques.byBase,
    uniquesByName: uniques.byName,
    setsByBase,
    itemRatios,
    superUniques,
  });
  const treasureClasses = loadTreasureClasses(classify);

  return {
    treasureClasses,
    baseItems,
    itemTypes,
    uniquesByBase: uniques.byBase,
    uniquesByName: uniques.byName,
    setsByBase,
    itemRatios,
    superUniques,
    counts: {
      treasureClasses: treasureClasses.size,
      baseItems: baseItems.size,
      itemTypes: itemTypes.size,
      uniqueItems: uniques.byName.size,
      setItems: [...setsByBase.values()].reduce((sum, items) => sum + items.length, 0),
      itemRatios: itemRatios.length,
      superUniques: superUniques.size,
    },
  };
}

function getTables(): Tables {
  tables ??= loadTables();
  return tables;
}

export function getD2TableCounts(): D2TableCounts {
  return getTables().counts;
}

export function getTreasureClass(name: string): TreasureClassView | null {
  return getTables().treasureClasses.get(name) ?? null;
}

export function getBaseItem(code: string): BaseItem | null {
  return getTables().baseItems.get(code) ?? null;
}

export function getItemType(code: string): ItemTypeRecord | null {
  return getTables().itemTypes.get(code) ?? null;
}

export function getUniqueItemsForBase(code: string): UniqueItemDrop[] {
  return getTables().uniquesByBase.get(code) ?? [];
}

export function getUniqueItemByName(name: string): UniqueItemDrop | null {
  return getTables().uniquesByName.get(name) ?? null;
}

export function getSetItemsForBase(code: string): SetItemDrop[] {
  return getTables().setsByBase.get(code) ?? [];
}

export function getSuperUnique(name: string): SuperUniqueDrop | null {
  return getTables().superUniques.get(name) ?? null;
}

export function getItemRatio(input: {
  version: number;
  uber: boolean;
  classSpecific: boolean;
}): ItemRatioRecord | null {
  return (
    getTables().itemRatios.find(
      (row) =>
        row.version === input.version &&
        row.uber === input.uber &&
        row.classSpecific === input.classSpecific,
    ) ?? null
  );
}

export function classifyDropToken(token: string): DropToken {
  const loaded = getTables();
  if (loaded.treasureClasses.has(token)) {
    return { kind: "treasureClass", name: token };
  }
  return createClassifier(loaded)(token);
}
