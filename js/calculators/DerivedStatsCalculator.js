// DerivedStatsCalculator.js - Calculate defences, thresholds, speed, encumbrance

class DerivedStatsCalculator {
  static calculate(character) {
    const attr = character.attributes;
    const classData = character.class;
    const race = character.race;

    // Defences (Attribute + Attribute + Class Bonus)
    const defences = {
      evasion: (attr.agi || 0) + (attr.gui || 0) + (classData?.defences?.evasion || 0),
      grit: (attr.str || 0) + (attr.wil || 0) + (classData?.defences?.grit || 0),
      intuition: (attr.int || 0) + (attr.per || 0) + (classData?.defences?.intuition || 0)
    };

    // Speed (AGI + STR)
    const speed = (attr.agi || 0) + (attr.str || 0);

    // Encumbrance (Size + STR + INT/2)
    const encumbrance = (race?.size || 0) + (attr.str || 0) + Math.floor((attr.int || 0) / 2);

    // Thresholds (attribute-based)
    const thresholds = {
      fatigue: attr.agi || 0,
      friction: attr.gui || 0,
      stress: attr.int || 0,
      strain: attr.per || 0,
      wounds: (attr.str || 0) + (race?.size || 0),
      corruption: attr.wil || 0
    };

    // DR (Damage Reduction) from armor
    let dr = 0;
    if (character.equipment?.armor) {
      dr += character.equipment.armor.dr || 0;
    }
    if (character.equipment?.shield) {
      dr += character.equipment.shield.dr || 0;
    }

    return {
      defences,
      speed,
      encumbrance,
      thresholds,
      dr
    };
  }

  // Calculate current encumbrance (sum of all equipped items)
  static calculateCurrentEncumbrance(character) {
    let total = 0;

    // Add weapon encumbrance
    if (character.equipment?.weapons) {
      character.equipment.weapons.forEach(weapon => {
        total += weapon.encumbrance || 0;
      });
    }

    // Add armor encumbrance
    if (character.equipment?.armor) {
      total += character.equipment.armor.encumbrance || 0;
    }

    // Add shield encumbrance
    if (character.equipment?.shield) {
      total += character.equipment.shield.encumbrance || 0;
    }

    // Add item encumbrance
    if (character.equipment?.items) {
      character.equipment.items.forEach(item => {
        total += item.encumbrance || 0;
      });
    }

    return total;
  }

  // Check if character is over-encumbered
  static isOverEncumbered(character) {
    const maxEncumbrance = this.calculate(character).encumbrance;
    const currentEncumbrance = this.calculateCurrentEncumbrance(character);
    return currentEncumbrance > maxEncumbrance;
  }
}
