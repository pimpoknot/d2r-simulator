export const RUNE_ORDER = [
  "El",
  "Eld",
  "Tir",
  "Nef",
  "Eth",
  "Ith",
  "Tal",
  "Ral",
  "Ort",
  "Thul",
  "Amn",
  "Sol",
  "Shael",
  "Dol",
  "Hel",
  "Io",
  "Lum",
  "Ko",
  "Fal",
  "Lem",
  "Pul",
  "Um",
  "Mal",
  "Ist",
  "Gul",
  "Vex",
  "Ohm",
  "Lo",
  "Sur",
  "Ber",
  "Jah",
  "Cham",
  "Zod",
] as const;

export const RUNE_SLOTS = ["weapon", "helmet", "armor", "shield"] as const;

export type RuneName = (typeof RUNE_ORDER)[number];
export type RuneSlot = (typeof RUNE_SLOTS)[number];

export type ScrapedRune = {
  name: RuneName;
  slug: string;
  tier: number;
  imageUrl: string;
  bonuses: Record<RuneSlot, string>;
};

const RUNE_NAMES = new Set<string>(RUNE_ORDER);

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function cellText(html: string) {
  return decodeHtml(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function attribute(attrs: string, name: string) {
  const match = attrs.match(
    new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function extractRuneTable(html: string) {
  const marker = 'id="list-of-all-runes-header"';
  const start = html.indexOf(marker);
  if (start < 0) {
    throw new Error("Maxroll page is missing the List Of All Runes section");
  }

  const nextHeading = html.indexOf("<h2", start + marker.length);
  const region = html.slice(start, nextHeading === -1 ? undefined : nextHeading);
  const tableStart = region.indexOf("<table");
  const tableEnd = region.indexOf("</table>");
  if (tableStart < 0 || tableEnd < 0) {
    throw new Error("Maxroll page is missing the rune bonus table");
  }

  return region.slice(tableStart, tableEnd);
}

function parseRow(rowHtml: string) {
  return [...rowHtml.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)].map((match) => {
    const attrs = match[1] ?? "";
    const colspan = Number(attribute(attrs, "colspan") ?? "1");
    if (!Number.isInteger(colspan) || colspan < 1) {
      throw new Error(`Invalid colspan in rune table: ${attrs}`);
    }
    if (attribute(attrs, "rowspan")) {
      throw new Error("Rune table uses rowspan, which this parser does not handle");
    }

    return {
      colspan,
      text: cellText(match[2] ?? ""),
      imageUrl: attribute(match[2] ?? "", "src"),
    };
  });
}

export function parseRuneTable(html: string): ScrapedRune[] {
  const table = extractRuneTable(html);
  const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((match) =>
    parseRow(match[0]),
  );
  const dataRows = rows.filter((cells) => cells[0]?.text !== "Rune");

  if (dataRows.length !== RUNE_ORDER.length) {
    throw new Error(
      `Expected ${RUNE_ORDER.length} runes, found ${dataRows.length}`,
    );
  }

  return dataRows.map((cells, index) => {
    const [nameCell, ...bonusCells] = cells;
    const expectedName = RUNE_ORDER[index];
    const label = nameCell?.text.replace(/\s+Rune$/, "") ?? "";

    if (!nameCell || label !== expectedName || !RUNE_NAMES.has(label)) {
      throw new Error(
        `Rune ${index + 1} was "${label}", expected "${expectedName}"`,
      );
    }

    if (!nameCell.imageUrl) {
      throw new Error(`Rune ${label} is missing an icon`);
    }

    const bonuses = {} as Record<RuneSlot, string>;
    let slotIndex = 0;

    for (const cell of bonusCells) {
      if (!cell.text) {
        throw new Error(`Rune ${label} has an empty bonus cell`);
      }
      if (slotIndex + cell.colspan > RUNE_SLOTS.length) {
        throw new Error(`Rune ${label} bonus cells exceed the equipment slots`);
      }

      for (let offset = 0; offset < cell.colspan; offset += 1) {
        const slot = RUNE_SLOTS[slotIndex];
        if (!slot) {
          throw new Error(`Rune ${label} has no slot at index ${slotIndex}`);
        }
        bonuses[slot] = cell.text;
        slotIndex += 1;
      }
    }

    if (slotIndex !== RUNE_SLOTS.length) {
      throw new Error(
        `Rune ${label} covered ${slotIndex} slots instead of ${RUNE_SLOTS.length}`,
      );
    }

    return {
      name: expectedName,
      slug: expectedName.toLowerCase(),
      tier: index + 1,
      imageUrl: nameCell.imageUrl,
      bonuses,
    };
  });
}
