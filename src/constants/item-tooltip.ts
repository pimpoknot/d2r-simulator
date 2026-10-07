export const ITEM_NAME_COLORS = {
  normal: "#ffffff",
  magic: "#6969ff",
  rare: "#ffff64",
  set: "#00ff00",
  unique: "#c7b377",
  crafted: "#ff8000",
  rune: "#e25c12",
} as const;

export const ITEM_REQUIREMENT_COLOR = "#e6c56a";

export type ItemQuality = keyof typeof ITEM_NAME_COLORS;

export type ItemTooltipLine = {
  text: string;
  color?: string;
  gapBefore?: boolean;
};

export type ItemTooltipItem = {
  name: string;
  quality?: ItemQuality;
  lines: ItemTooltipLine[];
};
