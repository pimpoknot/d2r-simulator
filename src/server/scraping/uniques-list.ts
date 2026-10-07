// Catalog for https://maxroll.gg/d2/database/uniques.
//
// The database page is a JS table. Its icons are not <img> URLs in the row
// markup: each row is a key from lod/data.json (`unique000`, `unique001`, …)
// and the icon is
// https://assets-ng.maxroll.gg/d2planner/images/uniques/<key>.webp
// `unique000` is The Gnasher, the first row. Keys are not a compact 1..N
// index — missing numbers are gaps, so the filename is the data key.

export const UNIQUE_DATA_URL =
  "https://assets-ng.maxroll.gg/d2planner/game/lod/data.json";
export const UNIQUE_STRINGS_URL =
  "https://assets-ng.maxroll.gg/d2planner/game/lod/strings.json";

const UNIQUE_IMAGE_ROOT =
  "https://assets-ng.maxroll.gg/d2planner/images/uniques";
const UNIQUE_PAGE_URL = "https://maxroll.gg/d2/database/uniques";

const UNIQUE_KEY_RE = /^unique\d+$/;
const COLOR_CODE_RE = /\u00ffc[\d:;&<]/g;

export type ScrapedUniqueItem = {
  /** URL-safe identifier, e.g. "andariel-s-visage" */
  slug: string;
  /** Display name as shown on the page, e.g. "Andariel's Visage" */
  name: string;
  /** Base item type shown under the name, e.g. "Demonhead" */
  baseType: string | null;
  /** List page anchored at this catalog key */
  pageUrl: string;
  /** CDN icon in the same order as the database table */
  imageUrl: string;
};

type BaseItem = {
  name?: unknown;
  namestr?: unknown;
};

export function uniqueImageUrl(key: string) {
  return `${UNIQUE_IMAGE_ROOT}/${key.toLowerCase()}.webp`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** strings.json is a list of pairs, then a tail of nulls. First key wins. */
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

/** Apostrophe becomes a hyphen, then other non-alphanumerics collapse. */
export function uniqueSlug(name: string) {
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

/**
 * Walk `uniqueItems` in file order. That order is the default
 * "All Unique Items" table on the database page.
 */
export function parseUniqueCatalog(
  data: unknown,
  stringRows: unknown,
): ScrapedUniqueItem[] {
  if (!isRecord(data) || !isRecord(data.uniqueItems)) {
    throw new Error("Maxroll data.json is missing uniqueItems");
  }

  const strings = buildStringMap(stringRows);
  const draft: Array<{
    key: string;
    slugBase: string;
    name: string;
    baseType: string | null;
  }> = [];

  for (const [key, value] of Object.entries(data.uniqueItems)) {
    if (!UNIQUE_KEY_RE.test(key) || !isRecord(value)) continue;

    const index = asString(value.index);
    const code = asString(value.code);
    if (!index || !code) continue;

    const name = (strings.get(index) ?? index).trim();
    const slugBase = uniqueSlug(name) || key;
    draft.push({
      key,
      slugBase,
      name,
      baseType: baseItemName(data, code, strings),
    });
  }

  if (draft.length === 0) {
    throw new Error("Maxroll data.json uniqueItems catalog is empty");
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
    pageUrl: `${UNIQUE_PAGE_URL}#${item.key}`,
    imageUrl: uniqueImageUrl(item.key),
  }));
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadUniqueCatalog() {
  const [data, stringRows] = await Promise.all([
    fetchJson(UNIQUE_DATA_URL),
    fetchJson(UNIQUE_STRINGS_URL),
  ]);
  return parseUniqueCatalog(data, stringRows);
}
