// SkillPointValidator.js - Validate skill point allocation

class SkillPointValidator {
  static validate(character) {
    const classData = character.class;
    const level = character.level || 1;

    // Calculate available skill points
    let available = (classData?.skillPoints || 0) + (character.attributes?.int || 0);

    // Add progression skill points based on level
    if (classData?.progression?.skillPoints) {
      classData.progression.skillPoints.forEach(lvl => {
        if (level >= lvl) available += 2;
      });
    }

    // Calculate spent skill points
    const spent = Object.values(character.skills || {}).reduce((sum, points) => sum + points, 0);

    // Check for overspending
    if (spent > available) {
      return {
        valid: false,
        available,
        spent,
        message: `Too many skill points allocated. Available: ${available}, Spent: ${spent}`
      };
    }

    // Check for exceeding 5 points per skill (max without special talents)
    const maxPerSkill = 5;
    for (let [skill, points] of Object.entries(character.skills || {})) {
      if (points > maxPerSkill) {
        return {
          valid: false,
          available,
          spent,
          message: `${skill} has too many points. Maximum: ${maxPerSkill}`
        };
      }
    }

    return {
      valid: true,
      available,
      spent,
      remaining: available - spent
    };
  }

  // Get skill modifier (attribute + skill points)
  static getSkillModifier(character, skillName) {
    const skillAttrMap = {
      reflex: 'agi',
      stealth: 'agi',
      deception: 'gui',
      streetwise: 'gui',
      lore: 'int',
      medicine: 'int',
      tech: 'int',
      investigation: 'per',
      ranged: 'per',
      fitness: 'str',
      melee: 'str',
      composure: 'wil'
    };

    const attr = skillAttrMap[skillName.toLowerCase()];
    const attrValue = character.attributes?.[attr] || 0;
    const skillPoints = character.skills?.[skillName.toLowerCase()] || 0;

    return attrValue + skillPoints;
  }
}
