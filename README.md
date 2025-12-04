# Avrellant 5E Character Builder

A web-based character builder for the Avrellant TTRPG system.

## Features

- Character creation with races, classes, and backgrounds
- Attribute arrays and skill point allocation
- Automatic calculation of derived stats (Evasion, Grit, Intuition, etc.)
- Printable character sheets with optimized layout
- Content management system for uploading game data
- LocalStorage-based character saving
- Import/Export characters as JSON

## Getting Started

### Online Version
Visit the live version at: [Your GitHub Pages URL will be here]

### Local Development

1. Clone this repository
2. Run a local web server in the project directory:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Content Loading

The app supports two methods for loading game content:

### 1. Auto-Load from Data Folders
Create folders in the `data/` directory with index files:
- `data/races/index.json` - Lists all race .txt files
- `data/classes/index.json` - Lists all class .txt files
- `data/backgrounds/index.json` - Lists all background .txt files
- `data/talents/index.json` - Lists all talent .txt files
- `data/armoury/index.json` - Lists all equipment .txt files

Example `index.json`:
```json
[
  "sample-races.txt",
  "additional-races.txt"
]
```

### 2. Manual Upload
Use the upload buttons in the Content Upload section to manually add .txt files.

## File Format

Content files use a simple text format parsed by the app. See existing files in `data/samples/` for examples.

## Printing

The app includes optimized print styles for character sheets:
- Font sizes optimized for readability
- Automatic page break controls
- Black and white optimization for printing
- Compact layout to fit on standard letter-size paper

## Technologies

- Vanilla JavaScript (no frameworks)
- HTML5 & CSS3
- LocalStorage API for persistence
- Modular parser system for game content

## License

[Add your license here]

## Credits

Built for the Avrellant TTRPG System
