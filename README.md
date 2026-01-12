# Worthy Derby Voting App

A web application for running derby voting events. Built for Trail Life troops' annual Worthy Derby competitions.

## Features

- **Troop Customization**: Configure your troop's state, number, city, and charter organization
- **Event Management**: Create and manage multiple derby events with custom names and dates
- **Category Setup**: Define voting categories (e.g., "Most Creative", "Best Paint Job", "Coolest Design") with ability to rename and reorder
- **Car Registration**: Register cars by number with optional names for winner announcements
- **Print Voting Slips**: Generate printable ballot slips for voters with your troop information
- **Vote Entry**: Fast slip-based voting interface - enter all category votes from a single ballot at once
- **Live Results**: Real-time vote tallies with visual bar charts showing top 5 cars per category
- **Presentation Mode**: Full-screen results display for projecting at events
- **Data Persistence**: All data stored in browser localStorage
- **Import/Export**: Backup and restore event data as JSON files

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Configuring Your Troop

The application is configured for Troop TX-0521 (Van Alstyne, TX). To customize for a different troop, edit `troop-config.json` in the project root:

- **troopState**: Two-letter state code (required, must be 2 uppercase letters)
- **troopNumber**: Four-digit troop number (required, must be exactly 4 digits)
- **troopCity**: City name (optional)
- **charterOrg**: Charter organization name (optional)
- **troopWebsite**: URL for the troop's website (optional, must start with http:// or https://)
- **charterWebsite**: URL for the charter organization's website (optional, must start with http:// or https://)

This information will appear in:
- Browser tab title (e.g., "Worthy Derby Voting | Troop TX-0521")
- Sidebar header: "Trail Life Troop TX-0521" (links to troopWebsite if provided)
- Sidebar footer: charter org (links to charterWebsite if provided) and city/state
- Printed voting slips (with charter org and city/state if provided)

**Note**: After editing the config file, you must rebuild the application (`npm run build`) for changes to take effect, as the config is bundled into the application at build time.

## Usage

### Setting Up an Event

1. Create a new event or select an existing one from the sidebar
2. Go to **Setup** to configure:
   - Event name and date
   - Voting categories
   - Car number range and optional car names

### Collecting Votes

1. Go to **Vote** to enter ballots
2. For each paper ballot slip, enter the car number for each category
3. Press Enter or click "Submit Slip" to record all votes at once
4. Use "Undo Last" if you make a mistake

### Viewing Results

1. Go to **Results** to see live vote tallies
2. Toggle "Show car names" if you've added names to cars
3. Click "Present" for full-screen presentation mode (press Escape or click Exit to leave)

## Data Storage

All data is stored in the browser's localStorage under the key `derby-vote-data`. Use the Export/Import feature in Setup to backup your data or transfer between devices. The Danger Zone section provides options to delete individual events or clear all local data.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS
- localStorage for persistence

## License

MIT
