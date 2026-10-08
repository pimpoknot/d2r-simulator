import { ItemRawProp } from "./types";

export interface TranslatedStat {
  text: string;
  color: string;
}

export function translateStats(rawProps: ItemRawProp[]): TranslatedStat[] {
  const stats: TranslatedStat[] = [];
  
  for (const p of rawProps) {
    let text = p.prop; // fallback
    const val = p.max && p.min === p.max ? p.max.toString() : (p.min && p.max ? `${p.min}-${p.max}` : (p.min ?? p.max ?? "").toString());
    
    switch (p.prop) {
      case "dmg%": text = `+${val}% Enhanced Damage`; break;
      case "ac%": text = `+${val}% Enhanced Defense`; break;
      case "str": text = `+${val} to Strength`; break;
      case "dex": text = `+${val} to Dexterity`; break;
      case "vit": text = `+${val} to Vitality`; break;
      case "enr": text = `+${val} to Energy`; break;
      case "hp": text = `+${val} to Life`; break;
      case "mana": text = `+${val} to Mana`; break;
      case "ac": text = `+${val} Defense`; break;
      case "att": text = `+${val} to Attack Rating`; break;
      case "att%": text = `+${val}% Bonus to Attack Rating`; break;
      case "res-all": text = `All Resistances +${val}`; break;
      case "res-fire": text = `Fire Resist +${val}%`; break;
      case "res-ltng": text = `Lightning Resist +${val}%`; break;
      case "res-cold": text = `Cold Resist +${val}%`; break;
      case "res-pois": text = `Poison Resist +${val}%`; break;
      case "res-ltng-max": text = `+${val}% to Maximum Lightning Resist`; break;
      case "res-fire-max": text = `+${val}% to Maximum Fire Resist`; break;
      case "res-cold-max": text = `+${val}% to Maximum Cold Resist`; break;
      case "res-pois-max": text = `+${val}% to Maximum Poison Resist`; break;
      case "allskills": text = `+${val} to All Skills`; break;
      case "swing2":
      case "swing3":
      case "swing1": text = `+${val}% Increased Attack Speed`; break;
      case "balance1":
      case "balance2":
      case "balance3": text = `+${val}% Faster Hit Recovery`; break;
      case "block1":
      case "block2":
      case "block3": text = `+${val}% Faster Block Rate`; break;
      case "cast1":
      case "cast2":
      case "cast3": text = `+${val}% Faster Cast Rate`; break;
      case "runwalk": text = `+${val}% Faster Run/Walk`; break;
      case "lifesteal": text = `${val}% Life stolen per hit`; break;
      case "manasteal": text = `${val}% Mana stolen per hit`; break;
      case "crush": text = `${val}% Chance of Crushing Blow`; break;
      case "openwounds": text = `${val}% Chance of Open Wounds`; break;
      case "deadly": text = `${val}% Deadly Strike`; break;
      case "mag%": text = `${val}% Better Chance of Getting Magic Items`; break;
      case "dmg-norm": text = `+${val} Damage`; break;
      case "dmg-min": text = `+${val} to Minimum Damage`; break;
      case "dmg-max": text = `+${val} to Maximum Damage`; break;
      case "dmg-fire": text = `Adds ${val} Fire Damage`; break;
      case "dmg-ltng": text = `Adds ${val} Lightning Damage`; break;
      case "dmg-cold": text = `Adds ${val} Cold Damage`; break;
      case "dmg-pois": text = `Adds ${val} Poison Damage`; break;
      case "abs-fire": text = `Fire Absorb +${val}`; break;
      case "abs-ltng": text = `Lightning Absorb +${val}`; break;
      case "abs-cold": text = `Cold Absorb +${val}`; break;
      case "abs-fire%": text = `Fire Absorb ${val}%`; break;
      case "abs-ltng%": text = `Lightning Absorb ${val}%`; break;
      case "abs-cold%": text = `Cold Absorb ${val}%`; break;
      case "red-dmg": text = `Damage Reduced by ${val}`; break;
      case "red-dmg%": text = `Damage Reduced by ${val}%`; break;
      case "red-mag": text = `Magic Damage Reduced by ${val}`; break;
      case "indestruct": text = `Indestructible`; break;
      case "socket": text = `Socketed (${val})`; break;
      case "regen-mana": text = `Regenerate Mana ${val}%`; break;
      case "regen-hp": text = `Replenish Life +${val}`; break;
      case "ethereal": text = `Ethereal (Cannot be Repaired)`; break;
      case "knock": text = `Knockback`; break;
      case "pierce": text = `Piercing Attack`; break;
      case "heal-kill": text = `+${val} Life after each Kill`; break;
      case "mana-kill": text = `+${val} Mana after each Kill`; break;
      case "light": text = `+${val} to Light Radius`; break;
      case "reduce-req": text = `Requirements -${val}%`; break;
      case "freeze": text = `Freezes Target`; break;
      case "half-freeze": text = `Half Freeze Duration`; break;
      case "nofreeze": text = `Cannot Be Frozen`; break;
      case "att-demon": text = `+${val} to Attack Rating against Demons`; break;
      case "att-undead": text = `+${val} to Attack Rating against Undead`; break;
      case "dmg-demon": text = `+${val}% Damage to Demons`; break;
      case "dmg-undead": text = `+${val}% Damage to Undead`; break;
      case "skill": text = `+${val} to Skill (${p.par})`; break; // Simplified for now
      case "skilltab": text = `+${val} to Skill Tab (${p.par})`; break;
      case "hit-skill": text = `${p.min}% Chance to cast level ${p.max} Skill (${p.par}) on striking`; break;
      case "gethit-skill": text = `${p.min}% Chance to cast level ${p.max} Skill (${p.par}) when struck`; break;
      case "charged": text = `Level ${p.max} Skill (${p.par}) (${p.min}/${p.min} Charges)`; break;
      default:
        text = `[${p.prop} = ${val} par=${p.par}]`;
    }

    stats.push({ text, color: "text-[#6969ff]" }); // Magic properties are typically blue
  }

  return stats;
}
