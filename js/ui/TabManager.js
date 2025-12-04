// TabManager.js - Handle tab navigation

class TabManager {
  constructor() {
    this.tabs = ['basics', 'skills', 'equipment', 'talents', 'spells', 'sheet'];
    this.currentTab = 'basics';
  }

  init() {
    this.setupTabs();
    this.switchTab('basics');
  }

  setupTabs() {
    // Create tab buttons
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    tabBar.innerHTML = '';
    this.tabs.forEach(tabId => {
      const button = document.createElement('button');
      button.id = `tab-btn-${tabId}`;
      button.className = 'tab-button';
      button.textContent = this.capitalize(tabId);
      button.onclick = () => this.switchTab(tabId);
      tabBar.appendChild(button);
    });
  }

  switchTab(tabId) {
    // Hide all tab contents
    this.tabs.forEach(id => {
      const content = document.getElementById(`tab-${id}`);
      const button = document.getElementById(`tab-btn-${id}`);
      if (content) content.style.display = 'none';
      if (button) button.classList.remove('active');
    });

    // Show selected tab
    const selectedContent = document.getElementById(`tab-${tabId}`);
    const selectedButton = document.getElementById(`tab-btn-${tabId}`);
    if (selectedContent) selectedContent.style.display = 'block';
    if (selectedButton) selectedButton.classList.add('active');

    this.currentTab = tabId;

    // Update app state if available
    if (window.AppState) {
      window.AppState.ui.currentTab = tabId;
    }

    // Hide Spells tab if not spellcaster
    this.updateSpellsTabVisibility();
  }

  updateSpellsTabVisibility() {
    const spellsButton = document.getElementById('tab-btn-spells');
    if (!spellsButton) return;

    const character = window.AppState?.character;
    const isSpellcaster = character?.class?.spellcaster === true;

    spellsButton.style.display = isSpellcaster ? 'inline-block' : 'none';

    // If currently on spells tab and not a spellcaster, switch to basics
    if (this.currentTab === 'spells' && !isSpellcaster) {
      this.switchTab('basics');
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getCurrentTab() {
    return this.currentTab;
  }
}
