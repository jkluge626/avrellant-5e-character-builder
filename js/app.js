// app.js - Main application initialization and state management

// Global Application State
window.AppState = {
  character: {
    name: '',
    race: null,
    background: null,
    class: null,
    level: 1,
    xp: 0,
    baseAttributes: { agi: 0, gui: 0, int: 0, per: 0, str: 0, wil: 0 },
    attributes: { agi: 0, gui: 0, int: 0, per: 0, str: 0, wil: 0 },
    skills: {
      reflex: 0, stealth: 0, deception: 0, streetwise: 0,
      lore: 0, medicine: 0, tech: 0, investigation: 0,
      ranged: 0, fitness: 0, melee: 0, composure: 0
    },
    derivedStats: {
      defences: { evasion: 0, grit: 0, intuition: 0 },
      speed: 0,
      encumbrance: 0,
      dr: 0,
      thresholds: { fatigue: 0, friction: 0, stress: 0, strain: 0, wounds: 0, corruption: 0 }
    },
    talents: [],
    spells: [],
    equipment: {
      weapons: [],
      armor: null,
      shield: null,
      items: []
    },
    money: 0
  },
  contentLibrary: {
    races: [],
    classes: [],
    backgrounds: [],
    talents: [],
    spells: [],
    equipment: []
  },
  attributeArrays: [],
  ui: {
    currentTab: 'basics',
    tabManager: null
  }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Avrellant Character Builder...');

  // Load attribute arrays
  await loadAttributeArrays();

  // Auto-load sample files if no content exists
  await autoLoadSampleFiles();

  // Load content from localStorage
  loadContentFromStorage();

  // Initialize UI
  initializeUI();

  // Setup event listeners
  setupEventListeners();

  // Load saved character if exists
  loadSavedCharacter();

  console.log('Application initialized successfully');
});

// Load attribute arrays from JSON file
async function loadAttributeArrays() {
  try {
    const response = await fetch('data/attribute-arrays.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    AppState.attributeArrays = await response.json();
    console.log(`Loaded ${AppState.attributeArrays.length} attribute arrays`);
    populateAttributeArraySelect();
  } catch (error) {
    console.error('Error loading attribute arrays:', error);
    console.error('If opening from file://, you need to run a local web server.');
    console.error('Try: python -m http.server 8000 or npx http-server');

    // Fallback: Use hardcoded arrays if fetch fails
    useHardcodedAttributeArrays();
  }
}

// Fallback attribute arrays if file loading fails
function useHardcodedAttributeArrays() {
  console.log('Using hardcoded attribute arrays as fallback');
  AppState.attributeArrays = [
    { "id": 1, "name": "The Everyman", "values": [3, 3, 3, 3, 3, 3] },
    { "id": 2, "name": "The Specialist", "values": [4, 4, 3, 3, 2, 2] },
    { "id": 3, "name": "The Capable", "values": [4, 4, 4, 2, 2, 2] },
    { "id": 4, "name": "The Focused", "values": [4, 3, 3, 3, 3, 2] },
    { "id": 5, "name": "The Expert", "values": [5, 4, 3, 2, 2, 2] },
    { "id": 6, "name": "The Competent", "values": [5, 3, 3, 3, 2, 2] },
    { "id": 7, "name": "The Professional", "values": [5, 4, 2, 2, 2, 2] },
    { "id": 8, "name": "The Versatile", "values": [4, 4, 3, 3, 3, 1] },
    { "id": 9, "name": "The Dedicated", "values": [5, 3, 3, 2, 2, 2] },
    { "id": 10, "name": "The Unbalanced", "values": [4, 4, 4, 3, 1, 1] },
    { "id": 11, "name": "The Prodigy", "values": [5, 4, 3, 3, 1, 1] },
    { "id": 12, "name": "The Master", "values": [5, 5, 2, 2, 2, 1] },
    { "id": 13, "name": "The Savant", "values": [5, 5, 5, 1, 1, 1] }
  ];
  populateAttributeArraySelect();
}

// Auto-load files from data folders
async function autoLoadSampleFiles() {
  const dataCategories = [
    { folder: 'races', type: 'races', parser: RaceParser },
    { folder: 'classes', type: 'classes', parser: ClassParser },
    { folder: 'backgrounds', type: 'backgrounds', parser: BackgroundParser },
    { folder: 'talents', type: 'talents', parser: TalentParser },
    { folder: 'armoury', type: 'equipment', parser: null } // TODO: Add EquipmentParser
  ];

  let fetchFailed = false;

  for (const category of dataCategories) {
    try {
      // Check if content already exists in localStorage
      const existing = LocalStorageManager.loadContent(category.type);
      if (existing && existing.length > 0) {
        console.log(`Skipping ${category.type} - content already loaded`);
        continue;
      }

      // Skip if no parser available
      if (!category.parser) {
        console.log(`No parser available for ${category.type}, skipping`);
        continue;
      }

      // Try to load the data file for this category (e.g., data/races/races.txt)
      const filePath = `data/${category.folder}/${category.folder}.txt`;
      const fileResponse = await fetch(filePath);

      if (!fileResponse.ok) {
        console.log(`No data file found at ${filePath}, skipping auto-load for ${category.type}`);
        fetchFailed = true;
        continue;
      }

      const text = await fileResponse.text();
      const parsed = category.parser.parse(text);

      if (parsed && parsed.length > 0) {
        LocalStorageManager.saveContent(category.type, parsed);
        console.log(`Auto-loaded ${parsed.length} ${category.type} from ${category.folder}.txt`);
      }

    } catch (error) {
      console.log(`Could not auto-load ${category.type}:`, error.message);
      fetchFailed = true;
    }
  }

  // If fetch failed (likely file:// protocol), inform user
  if (fetchFailed) {
    console.log('Some data folders failed to load. To enable auto-loading:');
    console.log('1. Run a local web server (e.g., python -m http.server)');
    console.log('2. Place .txt files in data folders (e.g., backgrounds/races/classes.txt)');
    console.log('3. Or manually upload TXT files using the upload buttons');
  }
}

// Load content from localStorage
function loadContentFromStorage() {
  AppState.contentLibrary.races = LocalStorageManager.loadContent('races');
  AppState.contentLibrary.classes = LocalStorageManager.loadContent('classes');
  AppState.contentLibrary.backgrounds = LocalStorageManager.loadContent('backgrounds');
  AppState.contentLibrary.talents = LocalStorageManager.loadContent('talents');
  AppState.contentLibrary.spells = LocalStorageManager.loadContent('spells');

  updateContentLists();
  populateSelects();
}

// Initialize UI components
function initializeUI() {
  AppState.ui.tabManager = new TabManager();
  AppState.ui.tabManager.init();

  renderSkillsList();
}

// Setup all event listeners
function setupEventListeners() {
  // Content upload listeners
  document.getElementById('upload-races')?.addEventListener('change', (e) => handleFileUpload(e, 'races', RaceParser));
  document.getElementById('upload-classes')?.addEventListener('change', (e) => handleFileUpload(e, 'classes', ClassParser));
  document.getElementById('upload-backgrounds')?.addEventListener('change', (e) => handleFileUpload(e, 'backgrounds', BackgroundParser));
  document.getElementById('upload-talents')?.addEventListener('change', (e) => handleFileUpload(e, 'talents', TalentParser));

  // Character basics listeners
  document.getElementById('char-name')?.addEventListener('input', (e) => {
    AppState.character.name = e.target.value;
    autoSave();
    updateCharacterSheet();
  });

  document.getElementById('char-level')?.addEventListener('change', (e) => {
    AppState.character.level = parseInt(e.target.value) || 1;
    recalculateAll();
  });

  document.getElementById('attribute-array')?.addEventListener('change', handleArraySelection);
  document.getElementById('char-race')?.addEventListener('change', handleRaceSelection);
  document.getElementById('char-background')?.addEventListener('change', handleBackgroundSelection);
  document.getElementById('char-class')?.addEventListener('change', handleClassSelection);

  // Button listeners
  document.getElementById('btn-print-blank')?.addEventListener('click', printBlankSheet);
  document.getElementById('btn-print-character')?.addEventListener('click', printCharacterSheet);
  document.getElementById('btn-export-json')?.addEventListener('click', exportCharacter);
  document.getElementById('btn-import-json')?.addEventListener('click', importCharacter);
  document.getElementById('btn-new-character')?.addEventListener('click', newCharacter);
}

// Handle file upload
async function handleFileUpload(event, contentType, ParserClass) {
  const files = event.target.files;

  for (let file of files) {
    try {
      const text = await readFile(file);
      const parsed = ParserClass.parse(text);

      // Add to app state
      AppState.contentLibrary[contentType].push(...parsed);

      // Save to localStorage
      LocalStorageManager.saveContent(contentType, parsed);

      console.log(`Loaded ${parsed.length} ${contentType} from ${file.name}`);
    } catch (error) {
      console.error(`Error parsing ${file.name}:`, error);
      alert(`Failed to parse ${file.name}. Check console for details.`);
    }
  }

  updateContentLists();
  populateSelects();
}

// Read file as text
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Update content lists display
function updateContentLists() {
  updateContentList('races');
  updateContentList('classes');
  updateContentList('backgrounds');
  updateContentList('talents');
  updateContentSummary();
}

function updateContentList(type) {
  const listElement = document.getElementById(`${type}-list`);
  if (!listElement) return;

  const items = AppState.contentLibrary[type];
  listElement.innerHTML = items.length > 0
    ? `${items.length} ${type} loaded`
    : 'No content loaded';
}

// Update content summary panel
function updateContentSummary() {
  // Update counts
  document.getElementById('summary-races').textContent = AppState.contentLibrary.races.length;
  document.getElementById('summary-classes').textContent = AppState.contentLibrary.classes.length;
  document.getElementById('summary-backgrounds').textContent = AppState.contentLibrary.backgrounds.length;
  document.getElementById('summary-talents').textContent = AppState.contentLibrary.talents.length;
  document.getElementById('summary-spells').textContent = AppState.contentLibrary.spells.length;
  document.getElementById('summary-equipment').textContent = AppState.contentLibrary.equipment.length;

  // Update detailed lists for races, classes, and backgrounds
  const racesList = document.getElementById('summary-races-list');
  if (racesList) {
    racesList.innerHTML = AppState.contentLibrary.races.length > 0
      ? AppState.contentLibrary.races.map(r => `<div class="summary-details-item">${r.name}</div>`).join('')
      : '<div class="summary-details-item">None loaded</div>';
  }

  const classesList = document.getElementById('summary-classes-list');
  if (classesList) {
    classesList.innerHTML = AppState.contentLibrary.classes.length > 0
      ? AppState.contentLibrary.classes.map(c => `<div class="summary-details-item">${c.name}</div>`).join('')
      : '<div class="summary-details-item">None loaded</div>';
  }

  const backgroundsList = document.getElementById('summary-backgrounds-list');
  if (backgroundsList) {
    backgroundsList.innerHTML = AppState.contentLibrary.backgrounds.length > 0
      ? AppState.contentLibrary.backgrounds.map(b => `<div class="summary-details-item">${b.name}</div>`).join('')
      : '<div class="summary-details-item">None loaded</div>';
  }
}

// Populate dropdowns
function populateSelects() {
  populateSelect('char-race', AppState.contentLibrary.races);
  populateSelect('char-class', AppState.contentLibrary.classes);
  populateSelect('char-background', AppState.contentLibrary.backgrounds);
}

function populateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Keep the first option (placeholder)
  const placeholder = select.options[0];
  select.innerHTML = '';
  select.appendChild(placeholder);

  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

function populateAttributeArraySelect() {
  const select = document.getElementById('attribute-array');
  if (!select) return;

  AppState.attributeArrays.forEach(array => {
    const option = document.createElement('option');
    option.value = array.id;
    option.textContent = `${array.id}. ${array.name} [${array.values.join(', ')}]`;
    select.appendChild(option);
  });
}

// Handle selections
function handleArraySelection(e) {
  const arrayId = parseInt(e.target.value);
  const selectedArray = AppState.attributeArrays.find(a => a.id === arrayId);

  if (selectedArray) {
    // Store the selected array
    AppState.selectedArray = selectedArray;

    // Show assignment UI and populate dropdowns
    const assignmentSection = document.getElementById('attribute-assignment');
    if (assignmentSection) {
      assignmentSection.style.display = 'block';
    }

    // Populate assignment dropdowns
    const attrs = ['agi', 'gui', 'int', 'per', 'str', 'wil'];
    attrs.forEach(attr => {
      const select = document.getElementById(`assign-${attr}`);
      if (select) {
        // Keep the placeholder
        select.innerHTML = '<option value="">--</option>';
        // Add array values as options
        selectedArray.values.forEach((value, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.textContent = value;
          select.appendChild(option);
        });
      }
    });

    // Show preview
    const preview = document.getElementById('array-preview');
    if (preview) {
      preview.innerHTML = `<strong>Values:</strong> ${selectedArray.values.join(', ')}
        <span style="font-size: 0.8rem; color: #666;">(Assign values to attributes below)</span>`;
    }

    // Reset base attributes until user assigns them
    const resetAttrs = ['agi', 'gui', 'int', 'per', 'str', 'wil'];
    resetAttrs.forEach(attr => {
      AppState.character.baseAttributes[attr] = 0;
    });

    recalculateAll();
  } else {
    // Hide assignment section if no array selected
    const assignmentSection = document.getElementById('attribute-assignment');
    if (assignmentSection) {
      assignmentSection.style.display = 'none';
    }
  }
}

// Handle attribute assignment
window.handleAttributeAssignment = function() {
  if (!AppState.selectedArray) return;

  const attrs = ['agi', 'gui', 'int', 'per', 'str', 'wil'];
  const usedIndices = new Set();
  let allAssigned = true;

  // First pass: collect used indices and check if all assigned
  attrs.forEach(attr => {
    const select = document.getElementById(`assign-${attr}`);
    if (select && select.value !== '') {
      usedIndices.add(parseInt(select.value));
    } else {
      allAssigned = false;
    }
  });

  // Second pass: update attribute values and disable used options
  attrs.forEach(attr => {
    const select = document.getElementById(`assign-${attr}`);
    if (!select) return;

    const currentValue = select.value;

    // Update options to disable already-used values
    Array.from(select.options).forEach(option => {
      if (option.value === '') return; // Skip placeholder

      const optionIndex = parseInt(option.value);
      // Disable if used by another attribute
      option.disabled = usedIndices.has(optionIndex) && currentValue !== option.value;
    });

    // Update base attribute value
    if (currentValue !== '') {
      const arrayIndex = parseInt(currentValue);
      AppState.character.baseAttributes[attr] = AppState.selectedArray.values[arrayIndex];
    } else {
      AppState.character.baseAttributes[attr] = 0;
    }
  });

  recalculateAll();
};

function handleRaceSelection(e) {
  const raceName = e.target.value;
  const race = AppState.contentLibrary.races.find(r => r.name === raceName);

  AppState.character.race = race || null;

  // Display race info
  const infoBox = document.getElementById('race-info');
  if (infoBox && race) {
    infoBox.innerHTML = `
      <strong>Size:</strong> ${race.size} | <strong>Languages:</strong> ${race.languages}<br>
      <strong>Attributes:</strong> ${Object.entries(race.attributes)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
        .join(', ')}<br>
      <strong>Traits:</strong> ${race.traits.map(t => t.name).join(', ')}
    `;
  }

  recalculateAll();
}

function handleBackgroundSelection(e) {
  const bgName = e.target.value;
  const background = AppState.contentLibrary.backgrounds.find(b => b.name === bgName);

  AppState.character.background = background || null;

  // Set starting money
  if (background) {
    AppState.character.money = background.money || 0;
    document.getElementById('money-display').textContent = AppState.character.money;
  }

  // Display background info
  const infoBox = document.getElementById('background-info');
  if (infoBox && background) {
    infoBox.innerHTML = `
      <strong>Lifestyle:</strong> ${background.lifestyle}<br>
      <strong>Starting Money:</strong> $${background.money}<br>
      <strong>Attributes:</strong> ${Object.entries(background.attributes)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
        .join(', ')}<br>
      <strong>Traits:</strong> ${background.traits.map(t => t.name).join(', ')}
    `;
  }

  recalculateAll();
}

function handleClassSelection(e) {
  const className = e.target.value;
  const classData = AppState.contentLibrary.classes.find(c => c.name === className);

  AppState.character.class = classData || null;

  // Display class info
  const infoBox = document.getElementById('class-info');
  if (infoBox && classData) {
    infoBox.innerHTML = `
      <strong>Defences:</strong>
      ${classData.defences.evasion} Evasion,
      ${classData.defences.grit} Grit,
      ${classData.defences.intuition} Intuition<br>
      <strong>Spellcaster:</strong> ${classData.spellcaster ? 'Yes' : 'No'}<br>
      <strong>Skill Points:</strong> ${classData.skillPoints} + INT
    `;
  }

  recalculateAll();

  // Update spells tab visibility
  AppState.ui.tabManager?.updateSpellsTabVisibility();
}

// Recalculate all derived stats
function recalculateAll() {
  // Calculate final attributes
  AppState.character.attributes = AttributeCalculator.calculate(AppState.character);

  // Calculate derived stats
  AppState.character.derivedStats = DerivedStatsCalculator.calculate(AppState.character);

  // Update displays
  updateAttributesDisplay();
  updateDerivedStatsDisplay();
  updateSkillModifiers();
  updateCharacterSheet();

  autoSave();
}

// Update attributes display
function updateAttributesDisplay() {
  const attrs = AppState.character.attributes;
  document.getElementById('attr-agi').textContent = attrs.agi;
  document.getElementById('attr-gui').textContent = attrs.gui;
  document.getElementById('attr-int').textContent = attrs.int;
  document.getElementById('attr-per').textContent = attrs.per;
  document.getElementById('attr-str').textContent = attrs.str;
  document.getElementById('attr-wil').textContent = attrs.wil;
}

// Update derived stats display
function updateDerivedStatsDisplay() {
  const stats = AppState.character.derivedStats;

  document.getElementById('stat-evasion').textContent = stats.defences.evasion;
  document.getElementById('stat-grit').textContent = stats.defences.grit;
  document.getElementById('stat-intuition').textContent = stats.defences.intuition;
  document.getElementById('stat-speed').textContent = stats.speed;
  document.getElementById('stat-encumbrance').textContent = stats.encumbrance;

  document.getElementById('threshold-fatigue').textContent = stats.thresholds.fatigue;
  document.getElementById('threshold-friction').textContent = stats.thresholds.friction;
  document.getElementById('threshold-stress').textContent = stats.thresholds.stress;
  document.getElementById('threshold-strain').textContent = stats.thresholds.strain;
  document.getElementById('threshold-wounds').textContent = stats.thresholds.wounds;
  document.getElementById('threshold-corruption').textContent = stats.thresholds.corruption;
}

// Render skills list
function renderSkillsList() {
  const skillsContainer = document.getElementById('skills-list');
  if (!skillsContainer) return;

  const skills = [
    'reflex', 'stealth', 'deception', 'streetwise',
    'lore', 'medicine', 'tech', 'investigation',
    'ranged', 'fitness', 'melee', 'composure'
  ];

  skillsContainer.innerHTML = skills.map(skill => `
    <div class="skill-item">
      <div class="skill-name">${skill.charAt(0).toUpperCase() + skill.slice(1)}</div>
      <div class="skill-modifier" id="skill-mod-${skill}">+0</div>
      <input type="number" id="skill-${skill}" min="0" max="5" value="0"
        onchange="handleSkillChange('${skill}', this.value)">
    </div>
  `).join('');
}

// Handle skill point allocation
window.handleSkillChange = function(skillName, value) {
  AppState.character.skills[skillName] = parseInt(value) || 0;

  // Validate skill points
  const validation = SkillPointValidator.validate(AppState.character);

  // Update available/spent display
  document.getElementById('skill-points-available').textContent = validation.available;
  document.getElementById('skill-points-spent').textContent = validation.spent;

  updateSkillModifiers();
  recalculateAll();
};

// Update skill modifiers
function updateSkillModifiers() {
  const skills = Object.keys(AppState.character.skills);
  skills.forEach(skill => {
    const modifier = SkillPointValidator.getSkillModifier(AppState.character, skill);
    const element = document.getElementById(`skill-mod-${skill}`);
    if (element) {
      element.textContent = `+${modifier}`;
    }
  });
}

// Update character sheet
function updateCharacterSheet() {
  CharacterSheetRenderer.render(AppState.character);
}

// Print functions
function printBlankSheet() {
  CharacterSheetRenderer.renderBlankSheet();
  setTimeout(() => window.print(), 100);
}

function printCharacterSheet() {
  updateCharacterSheet();
  setTimeout(() => window.print(), 100);
}

// Export character as JSON
function exportCharacter() {
  const json = JSON.stringify(AppState.character, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${AppState.character.name || 'character'}_${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Import character from JSON
function importCharacter() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    try {
      const text = await readFile(file);
      const character = JSON.parse(text);

      AppState.character = character;
      recalculateAll();
      updateUIFromCharacter();

      alert('Character imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      alert(`Failed to import character: ${error.message}`);
    }
  };

  input.click();
}

// Update UI from loaded character
function updateUIFromCharacter() {
  document.getElementById('char-name').value = AppState.character.name || '';
  document.getElementById('char-level').value = AppState.character.level || 1;

  // Update skill inputs
  Object.entries(AppState.character.skills).forEach(([skill, value]) => {
    const input = document.getElementById(`skill-${skill}`);
    if (input) input.value = value;
  });
}

// Auto-save character
function autoSave() {
  LocalStorageManager.saveCharacter(AppState.character);
}

// Load saved character
function loadSavedCharacter() {
  const saved = LocalStorageManager.loadCharacter();
  if (saved) {
    AppState.character = saved;
    updateUIFromCharacter();
    recalculateAll();
    console.log('Loaded saved character:', saved.name);
  }
}

// New character
function newCharacter() {
  if (confirm('Create a new character? Current character will be saved.')) {
    autoSave();
    location.reload();
  }
}
