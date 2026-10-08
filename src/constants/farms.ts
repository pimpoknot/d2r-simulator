export interface FarmKill {
  monster: string;
  treasureClass: string;
  count: number;
}

export interface FarmPreset {
  slug: string;
  name: string;
  area: string;
  difficulty: "Hell";
  note: string;
  kills: readonly FarmKill[];
}

/** Hell farms whose treasure class is already in the vendored D2R tables. */
export const FARM_PRESETS: readonly FarmPreset[] = [
  {
    slug: "andariel",
    name: "Andariel",
    area: "Catacumbas",
    difficulty: "Hell",
    note: "Drop de quest",
    kills: [{ monster: "Andariel", treasureClass: "Andarielq (H)", count: 1 }],
  },
  {
    slug: "mephisto",
    name: "Mephisto",
    area: "Fossa do Ódio",
    difficulty: "Hell",
    note: "Drop de quest",
    kills: [{ monster: "Mephisto", treasureClass: "Mephistoq (H)", count: 1 }],
  },
  {
    slug: "travincal",
    name: "Travincal",
    area: "Travincal",
    difficulty: "Hell",
    note: "Os três membros do Council",
    kills: [
      { monster: "Toorc Icefist", treasureClass: "Council (H)", count: 1 },
      { monster: "Geleb Flamefinger", treasureClass: "Council (H)", count: 1 },
      { monster: "Ismail Vilehand", treasureClass: "Council (H)", count: 1 },
    ],
  },
  {
    slug: "chaos",
    name: "Santuário do Caos",
    area: "Santuário do Caos",
    difficulty: "Hell",
    note: "Drop normal, com a quest já feita",
    kills: [{ monster: "Diablo", treasureClass: "Diablo (H)", count: 1 }],
  },
  {
    slug: "pindle",
    name: "Pindleskin",
    area: "Templo de Nihlathak",
    difficulty: "Hell",
    note: "Superúnico",
    kills: [{ monster: "Pindleskin", treasureClass: "Act 5 (H) Super Cx", count: 1 }],
  },
  {
    slug: "baal",
    name: "Baal",
    area: "Câmara da Pedra do Mundo",
    difficulty: "Hell",
    note: "Drop normal, com a quest já feita",
    kills: [{ monster: "Baal", treasureClass: "Baal (H)", count: 1 }],
  },
];
