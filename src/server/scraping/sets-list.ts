// Catalog for https://maxroll.gg/d2/database/set-items.
//
// The database page is a JS table. Its icons are not <img> URLs in the row
// markup: each row is a key from lod/data.json (`set000`, `set001`, …)
// and the icon is
// https://assets-ng.maxroll.gg/d2planner/images/sets/<key>.webp
// Keys are not a compact 1..N
// index — missing numbers are gaps, so the filename is the data key.

export const SET_DATA_URL =
  "https://assets-ng.maxroll.gg/d2planner/game/lod/data.json";
export const SET_STRINGS_URL =
  "https://assets-ng.maxroll.gg/d2planner/game/lod/strings.json";

const SET_IMAGE_ROOT =
  "https://assets-ng.maxroll.gg/d2planner/images/uniques";
const SET_PAGE_URL = "https://maxroll.gg/d2/database/set-items";

const SET_KEY_RE = /^set\d+$/;
const COLOR_CODE_RE = /\u00ffc[\d:;&<]/g;

export type ScrapedSetItem = {
  slug: string;
  name: string;
  baseType: string | null;
  pageUrl: string;
  imageUrl: string;
};

type BaseItem = {
  name?: unknown;
  namestr?: unknown;
};

export function setImageUrl(key: string) {
  return `${SET_IMAGE_ROOT}/${key.toLowerCase()}.webp`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function buildStringMap(rows: unknown) {
  if (!Array.isArray(rows)) {
    throw new Error("Maxroll strings.json is not a list of string pairs");
  }

  const strings = new Map<string, string>();
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const key = row[0];
    const value = row[1];
    if (typeof key !== "string" || typeof value !== "string") continue;
    if (!strings.has(key)) strings.set(key, value);
  }

  if (strings.size === 0) {
    throw new Error("Maxroll strings.json did not contain any string pairs");
  }

  return strings;
}

export function setSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function baseItemName(
  data: Record<string, unknown>,
  code: string,
  strings: Map<string, string>,
) {
  for (const bucketName of ["weapons", "armor", "misc"]) {
    const bucket = data[bucketName];
    if (!isRecord(bucket)) continue;
    const item = bucket[code];
    if (!isRecord(item)) continue;

    const base = item as BaseItem;
    const namestr = asString(base.namestr);
    const raw =
      (namestr ? strings.get(namestr) : undefined) ??
      asString(base.name) ??
      code;
    const line = raw.replace(COLOR_CODE_RE, "").split("\n").pop()?.trim();
    return line || null;
  }

  return null;
}

export function parseSetCatalog(
  data: unknown,
  stringRows: unknown,
): ScrapedSetItem[] {
  if (!isRecord(data) || !isRecord(data.setItems)) {
    throw new Error("Maxroll data.json is missing setItems");
  }

  const strings = buildStringMap(stringRows);
  const draft: Array<{
    key: string;
    slugBase: string;
    name: string;
    baseType: string | null;
  }> = [];

  for (const [key, value] of Object.entries(data.setItems)) {
    if (!SET_KEY_RE.test(key) || !isRecord(value)) continue;

    const index = asString(value.index);
    const code = asString(value.item); // SET ITEMS USE 'item' FOR THE BASE CODE
    if (!index || !code) continue;

    const name = (strings.get(index) ?? index).trim();
    const slugBase = setSlug(name) || key;
    draft.push({
      key,
      slugBase,
      name,
      baseType: baseItemName(data, code, strings),
    });
  }

  if (draft.length === 0) {
    throw new Error("Maxroll data.json setItems catalog is empty");
  }

  const slugCount = new Map<string, number>();
  for (const item of draft) {
    slugCount.set(item.slugBase, (slugCount.get(item.slugBase) ?? 0) + 1);
  }

  return draft.map((item) => ({
    slug:
      (slugCount.get(item.slugBase) ?? 0) > 1
        ? `${item.slugBase}-${item.key}`
        : item.slugBase,
    name: item.name,
    baseType: item.baseType,
    pageUrl: `${SET_PAGE_URL}#${item.key}`,
    imageUrl: setImageUrl(item.key),
  }));
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadSetCatalog() {
  const [data, stringRows] = await Promise.all([
    fetchJson(SET_DATA_URL),
    fetchJson(SET_STRINGS_URL),
  ]);
  return parseSetCatalog(data, stringRows);
}

