// AttributeCalculator.js - Calculate final attributes from base array + race + background

class AttributeCalculator {
  static calculate(character) {
    const attributes = {
      agi: 0,
      gui: 0,
      int: 0,
      per: 0,
      str: 0,
      wil: 0
    };

    // Start with base attributes from selected array
    if (character.baseAttributes) {
      Object.keys(attributes).forEach(attr => {
        attributes[attr] = character.baseAttributes[attr] || 0;
      });
    }

    // Add race bonuses
    if (character.race && character.race.attributes) {
      Object.keys(attributes).forEach(attr => {
        attributes[attr] += character.race.attributes[attr] || 0;
      });
    }

    // Add background bonuses
    if (character.background && character.background.attributes) {
      Object.keys(attributes).forEach(attr => {
        attributes[attr] += character.background.attributes[attr] || 0;
      });
    }

    return attributes;
  }

  // Get attribute modifier (for display purposes, e.g., INT modifier for skill points)
  static getModifier(attributeValue) {
    // In Avrellant, the attribute value is used directly, not a modifier
    // But we keep this method for compatibility if needed
    return attributeValue;
  }
}
