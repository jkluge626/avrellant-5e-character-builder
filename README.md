# Avrellant 5E Character Builder

A character building tool for the Avrellant fifth edition TTRPG system.

## Features

- Character creation with races, classes, backgrounds, attribute arrays and skill point allocation
- Derived stats calculation (Evasion, Grit, Intuition, etc.)
- Printable character sheets (blank or filled out)
- Content management system for uploading game data
- Import/Export characters as JSON

## Getting Started

### Online Version
Visit the live version at: https://jkluge626.github.io/avrellant-5e-character-builder/

### Local Development

1. Clone this repository
2. Run a local web server in the project directory:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Content Loading

The app will auto-load game data (backgrounds, classes, races, talents, spells, and equipment) and the user can also manually upload custom data .txt files. See the examples in the "data/samples/" folder for proper file structure.