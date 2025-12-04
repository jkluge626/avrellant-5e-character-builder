// BackgroundParser.js - Parse background data from TXT files

class BackgroundParser extends TxtParser {
  static parse(fileContent) {
    const backgrounds = [];
    const lines = this.cleanLines(fileContent);
    let currentBackground = null;

    for (let line of lines) {
      // New background header
      if (this.isSectionHeader(line)) {
        if (currentBackground) backgrounds.push(currentBackground);
        currentBackground = {
          name: this.parseSectionHeader(line),
          attributes: { agi: 0, gui: 0, int: 0, per: 0, str: 0, wil: 0 },
          lifestyle: '',
          money: 0,
          items: [],
          traits: []
        };
        continue;
      }

      if (!currentBackground) continue;

      // Parse key-value lines
      if (line.includes(':')) {
        const kv = this.parseKeyValue(line);
        if (!kv) continue;

        switch (kv.key.toLowerCase()) {
          case 'attributes':
            currentBackground.attributes = this.parseAttributes(kv.value);
            break;

          case 'lifestyle':
            // Parse "Humble ($4)" or just "Humble"
            currentBackground.lifestyle = kv.value;
            break;

          case 'money':
            const moneyMatch = kv.value.match(/\d+/);
            if (moneyMatch) {
              currentBackground.money = parseInt(moneyMatch[0]);
            }
            break;

          case 'item':
            currentBackground.items.push(kv.value);
            break;

          case 'trait':
            const trait = this.parseTrait(line);
            currentBackground.traits.push(trait);
            break;
        }
      }
    }

    // Don't forget the last background
    if (currentBackground) backgrounds.push(currentBackground);

    return backgrounds;
  }
}
