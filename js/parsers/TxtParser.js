// TxtParser.js - Base parser for TXT file format

class TxtParser {
  // Parse attribute bonuses from string like "+1 INT, +1 PER"
  static parseAttributes(attributeString) {
    const attributes = {
      agi: 0,
      gui: 0,
      int: 0,
      per: 0,
      str: 0,
      wil: 0
    };

    if (!attributeString) return attributes;

    const bonuses = attributeString.split(',');
    for (let bonus of bonuses) {
      const match = bonus.trim().match(/\+(\d+)\s+(\w+)/i);
      if (match) {
        const value = parseInt(match[1]);
        const attr = match[2].toLowerCase().substring(0, 3); // First 3 letters
        if (attributes.hasOwnProperty(attr)) {
          attributes[attr] = value;
        }
      }
    }

    return attributes;
  }

  // Parse trait from string like "Trait: Name | Description"
  static parseTrait(line) {
    const traitContent = line.substring(line.indexOf(':') + 1).trim();
    const parts = traitContent.split('|');
    return {
      name: parts[0].trim(),
      description: parts[1] ? parts[1].trim() : ''
    };
  }

  // Parse requirements from string like "Requires: 3 Agility, 10th level, Spellcaster"
  static parseRequirements(requiresString) {
    const requirements = {
      attributes: {},
      level: 0,
      talents: [],
      classRestrictions: []
    };

    if (!requiresString) return requirements;

    const parts = requiresString.split(',').map(s => s.trim());

    for (let part of parts) {
      // Attribute requirement (e.g., "3 Agility")
      const attrMatch = part.match(/(\d+)\s+(\w+)/);
      if (attrMatch) {
        const value = parseInt(attrMatch[1]);
        const attr = attrMatch[2].toLowerCase();

        // Map full attribute names to abbreviations
        const attrMap = {
          'agility': 'agi',
          'guile': 'gui',
          'intellect': 'int',
          'perception': 'per',
          'strength': 'str',
          'willpower': 'wil'
        };

        const attrKey = attrMap[attr] || attr.substring(0, 3);
        requirements.attributes[attrKey] = value;
        continue;
      }

      // Level requirement (e.g., "10th level" or "6th level")
      const levelMatch = part.match(/(\d+)(?:st|nd|rd|th)\s+level/i);
      if (levelMatch) {
        requirements.level = parseInt(levelMatch[1]);
        continue;
      }

      // Class restrictions (e.g., "Spellcaster", "Armsman")
      if (part.toLowerCase() === 'spellcaster') {
        requirements.classRestrictions.push('spellcaster');
      } else {
        // Assume it's a prerequisite talent
        requirements.talents.push(part);
      }
    }

    return requirements;
  }

  // Parse key-value line
  static parseKeyValue(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return null;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    return { key, value };
  }

  // Check if line is a section header (starts with #)
  static isSectionHeader(line) {
    return line.trim().startsWith('#');
  }

  // Parse section header to get name
  static parseSectionHeader(line) {
    return line.substring(line.indexOf('#') + 1).trim();
  }

  // Trim and filter empty lines
  static cleanLines(content) {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}
