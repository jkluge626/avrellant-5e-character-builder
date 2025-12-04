// CharacterSheetRenderer.js - Render printable character sheet

class CharacterSheetRenderer {
  static render(character) {
    const sheet = document.getElementById('character-sheet');
    if (!sheet) return;

    const derivedStats = character.derivedStats || {};
    const attributes = character.attributes || {};
    const skills = character.skills || {};

    sheet.innerHTML = `
      <div class="character-sheet">
        ${this.renderHeader(character)}
        <div class="sheet-main-layout">
          <div class="sheet-left-column">
            ${this.renderAttributesWithSkills(attributes, skills)}
            ${this.renderThresholdsCompact(derivedStats.thresholds)}
            ${this.renderConditionsCompact()}
          </div>
          <div class="sheet-right-column">
            ${this.renderDefences(derivedStats.defences)}
            ${this.renderDerivedStats(derivedStats)}
            ${this.renderWeapons(character.equipment?.weapons || [])}
          </div>
        </div>
        ${this.renderTraitsExpanded(character)}
      </div>
      ${character.spells && character.spells.length > 0 ? this.renderSpellPage(character.spells) : ''}
    `;
  }

  static renderBlankSheet() {
    const sheet = document.getElementById('character-sheet');
    if (!sheet) return;

    const emptyCharacter = {
      name: '',
      race: { name: '' },
      background: { name: '' },
      class: { name: '' },
      level: '',
      xp: '',
      attributes: { agi: '', gui: '', int: '', per: '', str: '', wil: '' },
      skills: { reflex: '', stealth: '', deception: '', streetwise: '', lore: '', medicine: '', tech: '', investigation: '', ranged: '', fitness: '', melee: '', composure: '' },
      derivedStats: {
        defences: { evasion: '', grit: '', intuition: '' },
        speed: '',
        encumbrance: '',
        dr: '',
        thresholds: { fatigue: '', friction: '', stress: '', strain: '', wounds: '', corruption: '' }
      },
      equipment: { weapons: [], armor: null, shield: null, items: [] },
      talents: [],
      spells: []
    };

    this.render(emptyCharacter);
  }

  static renderHeader(character) {
    return `
      <div class="sheet-header">
        <div class="char-name"><strong>Name:</strong> ${character.name || '__________'}</div>
        <div><strong>Race:</strong> ${character.race?.name || '__________'}</div>
        <div><strong>Background:</strong> ${character.background?.name || '__________'}</div>
        <div><strong>Class:</strong> ${character.class?.name || '__________'}</div>
        <div><strong>Level:</strong> ${character.level || '___'}</div>
        <div><strong>XP:</strong> ${character.xp || '___'}</div>
      </div>
    `;
  }

  static renderAttributes(attributes) {
    const attrNames = ['AGI', 'GUI', 'INT', 'PER', 'STR', 'WIL'];
    const attrKeys = ['agi', 'gui', 'int', 'per', 'str', 'wil'];

    return `
      <div class="sheet-attributes">
        ${attrNames.map((name, i) => `
          <div class="sheet-attribute">
            <label>${name}</label>
            <div class="value">${attributes[attrKeys[i]] || 0}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  static renderSkills(skills, attributes) {
    const skillList = [
      { name: 'Reflex', key: 'reflex', attr: 'agi' },
      { name: 'Stealth', key: 'stealth', attr: 'agi' },
      { name: 'Deception', key: 'deception', attr: 'gui' },
      { name: 'Streetwise', key: 'streetwise', attr: 'gui' },
      { name: 'Lore', key: 'lore', attr: 'int' },
      { name: 'Medicine', key: 'medicine', attr: 'int' },
      { name: 'Tech', key: 'tech', attr: 'int' },
      { name: 'Investigation', key: 'investigation', attr: 'per' },
      { name: 'Ranged', key: 'ranged', attr: 'per' },
      { name: 'Fitness', key: 'fitness', attr: 'str' },
      { name: 'Melee', key: 'melee', attr: 'str' },
      { name: 'Composure', key: 'composure', attr: 'wil' }
    ];

    return `
      <div class="sheet-skills">
        ${skillList.map(skill => {
          const points = skills[skill.key] || 0;
          const modifier = (attributes[skill.attr] || 0) + points;
          return `
            <div class="sheet-skill">
              <label>${skill.name}</label>
              <div class="modifier">+${modifier}</div>
              <div class="checkboxes">
                ${[1,2,3,4,5].map(i =>
                  `<input type="checkbox" ${i <= points ? 'checked' : ''} disabled>`
                ).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  static renderDefences(defences = {}) {
    return `
      <div class="sheet-defences">
        <div class="sheet-defence">
          <label>Evasion</label>
          <div class="value">${defences.evasion || defences.evasion === 0 ? defences.evasion : '___'}</div>
        </div>
        <div class="sheet-defence">
          <label>Grit</label>
          <div class="value">${defences.grit || defences.grit === 0 ? defences.grit : '___'}</div>
        </div>
        <div class="sheet-defence">
          <label>Intuition</label>
          <div class="value">${defences.intuition || defences.intuition === 0 ? defences.intuition : '___'}</div>
        </div>
      </div>
    `;
  }

  static renderDerivedStats(derivedStats = {}) {
    const speed = derivedStats.speed || derivedStats.speed === 0 ? `${derivedStats.speed}m` : '___';
    const encumbrance = derivedStats.encumbrance || derivedStats.encumbrance === 0 ? derivedStats.encumbrance : '___';
    const dr = derivedStats.dr || derivedStats.dr === 0 ? derivedStats.dr : '___';

    return `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="border: 1px solid #333; padding: 0.5rem; background-color: #f9f9f9;">
          <strong>Speed:</strong> ${speed}
        </div>
        <div style="border: 1px solid #333; padding: 0.5rem; background-color: #f9f9f9;">
          <strong>Encumbrance:</strong> ${encumbrance}
        </div>
        <div style="border: 1px solid #333; padding: 0.5rem; background-color: #f9f9f9;">
          <strong>DR:</strong> ${dr}
        </div>
      </div>
    `;
  }

  static renderThresholds(thresholds = {}) {
    const thresholdList = [
      { name: 'Fatigue', key: 'fatigue' },
      { name: 'Friction', key: 'friction' },
      { name: 'Stress', key: 'stress' },
      { name: 'Strain', key: 'strain' },
      { name: 'Wounds', key: 'wounds' },
      { name: 'Corruption', key: 'corruption' }
    ];

    return `
      <div class="sheet-thresholds">
        ${thresholdList.map(threshold => {
          const value = thresholds[threshold.key] || 0;
          return `
            <div class="sheet-threshold">
              <label>${threshold.name}</label>
              <div class="threshold-value">${value}</div>
              <div class="track">
                ${Array(value || 1).fill(0).map(() => '<span class="track-box"></span>').join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  static renderConditions() {
    const conditions = ['Bleed', 'Burn', 'Cripple', 'Exhaustion', 'Fear', 'Poison', 'Sear', 'Spasm'];
    return `
      <div class="sheet-conditions">
        <h4 style="grid-column: 1 / -1;">Conditions</h4>
        ${conditions.map(name => `
          <div class="sheet-condition">
            <label>${name}:</label>
            <input type="text" value="" />
          </div>
        `).join('')}
      </div>
    `;
  }

  static renderWeapons(weapons) {
    // Always show exactly 3 weapon slots
    const weaponSlots = Array(3).fill(null).map((_, i) => weapons?.[i] || null);

    return `
      <div class="sheet-weapons">
        <h3>Weapons</h3>
        ${weaponSlots.map(weapon => `
          <div class="sheet-weapon">
            <div class="weapon-name">${weapon?.name || '_______________'}</div>
            <div class="weapon-stats-grid">
              <div><strong>Attack:</strong> ${weapon?.attack || '___'}</div>
              <div><strong>Damage:</strong> ${weapon?.damage || '___'}</div>
              <div><strong>Crit:</strong> ${weapon?.crit || '___'}</div>
              <div><strong>Range:</strong> ${weapon?.range || '___'}</div>
              <div><strong>Ammo:</strong> ${weapon?.ammo || '___'}</div>
            </div>
            <div class="weapon-properties"><strong>Properties:</strong> ${weapon?.properties ? weapon.properties.join(', ') : '_______________'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  static renderEquipment(equipment = {}) {
    return `
      <div class="sheet-equipment">
        <div class="equipment-section">
          <h4>Armor & Shield</h4>
          <p>${equipment.armor?.name || 'None'} ${equipment.armor ? `(DR ${equipment.armor.dr})` : ''}</p>
          <p>${equipment.shield?.name || 'None'} ${equipment.shield ? `(DR ${equipment.shield.dr})` : ''}</p>
        </div>
        <div class="equipment-section">
          <h4>Items</h4>
          ${(equipment.items || []).map(item => `<p>${item.name || item}</p>`).join('') || '<p>None</p>'}
        </div>
      </div>
    `;
  }

  static renderTraits(character) {
    const raceTraits = character.race?.traits || [];
    const backgroundTraits = character.background?.traits || [];
    const talents = character.talents || [];

    return `
      <div class="sheet-traits">
        <h3>Racial Traits</h3>
        ${raceTraits.map(trait => `
          <div class="trait-item">
            <div class="trait-name">${trait.name}</div>
            <div class="trait-description">${trait.description}</div>
          </div>
        `).join('') || '<p>None</p>'}

        <h3>Background Traits</h3>
        ${backgroundTraits.map(trait => `
          <div class="trait-item">
            <div class="trait-name">${trait.name}</div>
            <div class="trait-description">${trait.description}</div>
          </div>
        `).join('') || '<p>None</p>'}

        <h3>Talents</h3>
        ${talents.map(talent => `
          <div class="trait-item">
            <div class="trait-name">${talent.name}</div>
            <div class="trait-description">${talent.effect}</div>
          </div>
        `).join('') || '<p>None</p>'}
      </div>
    `;
  }

  // Compact layout methods
  static renderAttributesWithSkills(attributes, skills) {
    const attributeGroups = [
      { attr: 'agi', name: 'Agility', skills: ['reflex', 'stealth'] },
      { attr: 'gui', name: 'Guile', skills: ['deception', 'streetwise'] },
      { attr: 'int', name: 'Intellect', skills: ['lore', 'medicine', 'tech'] },
      { attr: 'per', name: 'Perception', skills: ['investigation', 'ranged'] },
      { attr: 'str', name: 'Strength', skills: ['fitness', 'melee'] },
      { attr: 'wil', name: 'Willpower', skills: ['composure'] }
    ];

    return `
      <div class="attributes-with-skills">
        ${attributeGroups.map(group => {
          const attrValue = attributes[group.attr];
          const displayAttr = attrValue || attrValue === 0 ? attrValue : '___';

          return `
          <div class="attribute-group">
            <div class="attribute-circle">
              <div class="attr-name">${group.name}</div>
              <div class="attr-value">${displayAttr}</div>
            </div>
            <div class="attribute-skills">
              ${group.skills.map(skillKey => {
                const points = skills[skillKey];
                const attr = attributes[group.attr];

                // Only calculate modifier if both values exist
                const hasValues = (attr || attr === 0) && (points || points === 0);
                const modifier = hasValues ? attr + points : '___';
                const displayPoints = points || points === 0 ? points : '___';

                const skillName = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);
                return `
                  <div class="compact-skill">
                    <span class="skill-name">${skillName}</span>
                    <span class="skill-mod">[+${modifier}]</span>
                    <span class="skill-points">${displayPoints}/5</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;
  }

  static renderThresholdsCompact(thresholds = {}) {
    const thresholdList = [
      { name: 'Fatigue', key: 'fatigue' },
      { name: 'Friction', key: 'friction' },
      { name: 'Stress', key: 'stress' },
      { name: 'Strain', key: 'strain' },
      { name: 'Wounds', key: 'wounds' },
      { name: 'Corruption', key: 'corruption' }
    ];

    return `
      <div class="thresholds-compact">
        ${thresholdList.map(threshold => {
          const value = thresholds[threshold.key];
          const displayValue = value || value === 0 ? value : '___';

          return `
          <div class="threshold-compact">
            <div class="threshold-label">${threshold.name}</div>
            <div class="threshold-box">
              <span>Threshold: ${displayValue}</span>
              <span class="threshold-tokens">___ Tokens</span>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;
  }

  static renderConditionsCompact() {
    const conditions = ['Bleed', 'Burn', 'Cripple', 'Exhaustion', 'Fear', 'Poison', 'Sear', 'Spasm'];
    return `
      <div class="conditions-compact">
        <h4>Conditions</h4>
        <div class="conditions-row">
          ${conditions.map(name => `
            <span class="condition-item">${name}: ___</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  static renderTraitsExpanded(character) {
    const raceTraits = character.race?.traits || [];
    const backgroundTraits = character.background?.traits || [];
    const talents = character.talents || [];

    return `
      <div class="traits-expanded">
        <h3>Ability / Spell / Trait Notes</h3>
        <div class="traits-content">
          ${raceTraits.length > 0 ? `
            <div class="trait-section">
              <strong>Race Traits:</strong>
              ${raceTraits.map(trait => `
                <div class="trait-line"><strong>${trait.name}:</strong> ${trait.description}</div>
              `).join('')}
            </div>
          ` : ''}

          ${backgroundTraits.length > 0 ? `
            <div class="trait-section">
              <strong>Background Traits:</strong>
              ${backgroundTraits.map(trait => `
                <div class="trait-line"><strong>${trait.name}:</strong> ${trait.description}</div>
              `).join('')}
            </div>
          ` : ''}

          ${talents.length > 0 ? `
            <div class="trait-section">
              <strong>Talents:</strong>
              ${talents.map(talent => `
                <div class="trait-line"><strong>${talent.name}:</strong> ${talent.effect}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  static renderSpellPage(spells) {
    return `
      <div class="spell-page">
        <h2>Spells</h2>
        ${spells.map(spell => `
          <div class="spell-entry">
            <h4>${spell.name}</h4>
            <div class="spell-stats">
              <div><strong>Target:</strong> ${spell.target || 'N/A'}</div>
              <div><strong>DV:</strong> ${spell.dv || 'N/A'}</div>
              <div><strong>Range:</strong> ${spell.range || 'N/A'}</div>
              <div><strong>Duration:</strong> ${spell.duration || 'N/A'}</div>
            </div>
            <div class="spell-effect">${spell.effect || ''}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
