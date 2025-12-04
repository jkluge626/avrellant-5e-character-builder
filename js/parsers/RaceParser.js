// RaceParser.js - Parse race data from TXT files

class RaceParser extends TxtParser {
  static parse(fileContent) {
    const races = [];
    const lines = this.cleanLines(fileContent);
    let currentRace = null;

    for (let line of lines) {
      // New race header
      if (this.isSectionHeader(line)) {
        if (currentRace) races.push(currentRace);
        currentRace = {
          name: this.parseSectionHeader(line),
          attributes: { agi: 0, gui: 0, int: 0, per: 0, str: 0, wil: 0 },
          size: 0,
          languages: 0,
          traits: []
        };
        continue;
      }

      if (!currentRace) continue;

      // Parse key-value lines
      if (line.includes(':')) {
        const kv = this.parseKeyValue(line);
        if (!kv) continue;

        switch (kv.key.toLowerCase()) {
          case 'attributes':
            currentRace.attributes = this.parseAttributes(kv.value);
            break;

          case 'size':
            currentRace.size = parseInt(kv.value);
            break;

          case 'languages':
            currentRace.languages = parseInt(kv.value);
            break;

          case 'trait':
            const trait = this.parseTrait(line);
            currentRace.traits.push(trait);
            break;
        }
      }
    }

    // Don't forget the last race
    if (currentRace) races.push(currentRace);

    return races;
  }
}
