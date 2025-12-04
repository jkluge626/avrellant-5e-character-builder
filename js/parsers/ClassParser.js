// ClassParser.js - Parse class data from TXT files

class ClassParser extends TxtParser {
  static parse(fileContent) {
    const classes = [];
    const lines = this.cleanLines(fileContent);
    let currentClass = null;

    for (let line of lines) {
      // New class header
      if (this.isSectionHeader(line)) {
        if (currentClass) classes.push(currentClass);
        currentClass = {
          name: this.parseSectionHeader(line),
          defences: { evasion: 0, grit: 0, intuition: 0 },
          spellcaster: false,
          hitPoints: '',
          abilities: [],
          skillPoints: 0,
          progression: {
            skillPoints: [],
            talents: []
          }
        };
        continue;
      }

      if (!currentClass) continue;

      // Parse key-value lines
      if (line.includes(':')) {
        const kv = this.parseKeyValue(line);
        if (!kv) continue;

        switch (kv.key.toLowerCase()) {
          case 'defences':
            // Parse "6 EVA, 8 GRI, 4 INT" or "+6 Evasion, +8 Grit, +4 Intuition"
            const defParts = kv.value.split(',');
            for (let part of defParts) {
              const match = part.trim().match(/\+?(\d+)\s+(EVA|GRI|INT|Evasion|Grit|Intuition)/i);
              if (match) {
                const value = parseInt(match[1]);
                const defType = match[2].toLowerCase();
                if (defType.startsWith('eva')) currentClass.defences.evasion = value;
                else if (defType.startsWith('gri')) currentClass.defences.grit = value;
                else if (defType.startsWith('int')) currentClass.defences.intuition = value;
              }
            }
            break;

          case 'hit points':
          case 'hitpoints':
            currentClass.hitPoints = kv.value;
            break;

          case 'spellcaster':
            currentClass.spellcaster = kv.value.toLowerCase() === 'yes' || kv.value.toLowerCase() === 'true';
            break;

          case 'skill points':
          case 'skillpoints':
            // Parse "4 + INT modifier" or just a number
            const spMatch = kv.value.match(/(\d+)/);
            if (spMatch) {
              currentClass.skillPoints = parseInt(spMatch[1]);
            }
            break;

          case 'skill point progression':
          case 'skillpoint progression':
            // Parse "Gain 2 skill points at levels 3, 6, 9, 12, 15, 18"
            const levels = kv.value.match(/\d+/g);
            if (levels) {
              currentClass.progression.skillPoints = levels.map(l => parseInt(l));
            }
            break;

          case 'talent progression':
            // Parse "Gain 1 Core Talent at levels 2, 4, 7, 10, 13, 16, 19"
            const talentLevels = kv.value.match(/\d+/g);
            if (talentLevels) {
              currentClass.progression.talents = talentLevels.map(l => parseInt(l));
            }
            break;

          case 'core abilities':
          case 'abilities':
            currentClass.abilities.push(kv.value);
            break;

          default:
            // Catch multi-line abilities (lines starting with -)
            if (line.trim().startsWith('-')) {
              currentClass.abilities.push(line.substring(1).trim());
            }
        }
      }
    }

    // Don't forget the last class
    if (currentClass) classes.push(currentClass);

    return classes;
  }
}
