// TalentParser.js - Parse talent data from TXT files

class TalentParser extends TxtParser {
  static parse(fileContent) {
    const talents = [];
    const lines = this.cleanLines(fileContent);
    let currentTalent = null;

    for (let line of lines) {
      // New talent header
      if (this.isSectionHeader(line)) {
        if (currentTalent) talents.push(currentTalent);
        currentTalent = {
          name: this.parseSectionHeader(line),
          requires: {
            attributes: {},
            level: 0,
            talents: [],
            classRestrictions: []
          },
          type: [],
          effect: ''
        };
        continue;
      }

      if (!currentTalent) continue;

      // Parse key-value lines
      if (line.includes(':')) {
        const kv = this.parseKeyValue(line);
        if (!kv) continue;

        switch (kv.key.toLowerCase()) {
          case 'requires':
          case 'requirement':
          case 'requirements':
            currentTalent.requires = this.parseRequirements(kv.value);
            break;

          case 'type':
            // Parse "Core, Weapon" or "Core" or "Arcane"
            currentTalent.type = kv.value.split(',').map(t => t.trim());
            break;

          case 'effect':
            currentTalent.effect = kv.value;
            break;
        }
      }
    }

    // Don't forget the last talent
    if (currentTalent) talents.push(currentTalent);

    return talents;
  }

  // Check if a character meets the talent's prerequisites
  static meetsPrerequisites(talent, character) {
    if (!talent || !character) return false;

    const req = talent.requires;

    // Check attribute requirements
    for (let [attr, minValue] of Object.entries(req.attributes)) {
      if (!character.attributes[attr] || character.attributes[attr] < minValue) {
        return false;
      }
    }

    // Check level requirement
    if (req.level > 0 && character.level < req.level) {
      return false;
    }

    // Check class restrictions
    if (req.classRestrictions.length > 0) {
      const isSpellcaster = character.class && character.class.spellcaster;
      if (req.classRestrictions.includes('spellcaster') && !isSpellcaster) {
        return false;
      }
    }

    // Check prerequisite talents
    if (req.talents.length > 0) {
      const characterTalentNames = character.talents.map(t => t.name);
      for (let requiredTalent of req.talents) {
        if (!characterTalentNames.includes(requiredTalent)) {
          return false;
        }
      }
    }

    return true;
  }
}
