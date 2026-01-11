// Local storage key
const STORAGE_KEY = 'derby-vote-data';

// Get all data from localStorage
export function getAllData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { events: {}, currentEventId: null };
  }
  return JSON.parse(data);
}

// Save all data to localStorage
export function saveAllData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Generate a unique ID for events
function generateEventId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get or create an event for a specific year (legacy support)
export function getEvent(year) {
  const data = getAllData();
  if (!data.events[year]) {
    data.events[year] = {
      id: year, // Use year as ID for legacy
      year,
      name: `Worthy Derby ${year}`,
      categories: [],
      carNames: {}, // { carNumber: name } - keys are the car numbers
      slips: [],
      createdAt: new Date().toISOString(),
    };
    saveAllData(data);
  }
  return data.events[year];
}

// Get event by ID
export function getEventById(id) {
  const data = getAllData();
  return data.events[id] || null;
}

// Create a new event
export function createEvent(name, eventDate) {
  const data = getAllData();
  const id = generateEventId();
  const year = eventDate ? new Date(eventDate).getFullYear().toString() : new Date().getFullYear().toString();

  const event = {
    id,
    year,
    name: name || `Worthy Derby ${year}`,
    eventDate: eventDate || new Date().toISOString().split('T')[0],
    categories: [],
    carNames: {}, // { carNumber: name } - keys are the car numbers
    slips: [],
    createdAt: new Date().toISOString(),
  };

  data.events[id] = event;
  data.currentEventId = id;
  saveAllData(data);
  return event;
}

// Save an event
export function saveEvent(event) {
  const data = getAllData();
  // Use event.id if available, otherwise fall back to year
  const key = event.id || event.year;
  data.events[key] = { ...event, id: key };
  saveAllData(data);
}

// Get all events sorted by date
export function getAllEvents() {
  const data = getAllData();
  return Object.values(data.events).sort((a, b) => {
    // Sort by eventDate or createdAt, most recent first
    const dateA = a.eventDate || a.createdAt;
    const dateB = b.eventDate || b.createdAt;
    return dateB.localeCompare(dateA);
  });
}

// Get all years that have events (legacy)
export function getAllYears() {
  const data = getAllData();
  return Object.keys(data.events).sort((a, b) => b - a);
}

// Get/set current event ID
export function getCurrentEventId() {
  const data = getAllData();
  return data.currentEventId;
}

export function setCurrentEventId(id) {
  const data = getAllData();
  data.currentEventId = id;
  saveAllData(data);
}

// Add a category to an event
export function addCategory(year, categoryName) {
  const event = getEvent(year);
  if (!event.categories.includes(categoryName)) {
    event.categories.push(categoryName);
    saveEvent(event);
  }
  return event;
}

// Remove a category from an event
export function removeCategory(year, categoryName) {
  const event = getEvent(year);
  event.categories = event.categories.filter(c => c !== categoryName);
  // Also remove votes for this category from slips
  if (event.slips) {
    event.slips = event.slips.map(slip => ({
      ...slip,
      votes: slip.votes.filter(v => v.category !== categoryName)
    })).filter(slip => slip.votes.length > 0); // Remove empty slips
  }
  saveEvent(event);
  return event;
}

// Get car numbers from carNames keys (sorted)
export function getCars(event) {
  return Object.keys(event.carNames || {}).map(Number).sort((a, b) => a - b);
}

// Get all votes from slips (derived, not stored separately)
export function getVotes(eventId) {
  const event = getEventById(eventId) || getEvent(eventId);
  if (!event || !event.slips) return [];
  return event.slips.flatMap(slip => slip.votes);
}

// Get vote tallies for an event
export function getVoteTallies(eventId) {
  const event = getEventById(eventId) || getEvent(eventId);
  if (!event) return {};

  const votes = getVotes(eventId);
  const cars = getCars(event);
  const tallies = {};

  event.categories.forEach(category => {
    tallies[category] = {};
    cars.forEach(car => {
      tallies[category][car] = 0;
    });
  });

  votes.forEach(vote => {
    if (tallies[vote.category] && tallies[vote.category][vote.carNumber] !== undefined) {
      tallies[vote.category][vote.carNumber]++;
    }
  });

  return tallies;
}

// Export data to JSON string
export function exportData(eventIds = null) {
  const allData = getAllData();

  // If no specific events requested, export all
  if (!eventIds || eventIds.length === 0 || eventIds.includes('all')) {
    return JSON.stringify(allData, null, 2);
  }

  // Export only selected events
  const filteredData = {
    events: {},
    currentEventId: allData.currentEventId
  };

  eventIds.forEach(id => {
    if (allData.events[id]) {
      filteredData.events[id] = allData.events[id];
    }
  });

  return JSON.stringify(filteredData, null, 2);
}

// Import data from JSON string
export function importData(jsonString) {
  const data = JSON.parse(jsonString);
  saveAllData(data);
  return data;
}

// Delete an event
export function deleteEvent(year) {
  const data = getAllData();
  delete data.events[year];
  saveAllData(data);
}

// Slips are stored directly in the event as event.slips
// Each slip is { timestamp, votes: [{ category, carNumber }, ...] }

export function getSlips(eventId) {
  const event = getEvent(eventId);
  return event?.slips || [];
}

export function addSlip(eventId, votes) {
  const data = getAllData();
  const event = data.events[eventId];
  if (!event) return [];

  if (!event.slips) event.slips = [];
  const slip = { timestamp: Date.now(), votes };
  event.slips.unshift(slip); // Add to front (most recent first)
  saveAllData(data);
  return event.slips;
}

export function removeLastSlip(eventId) {
  const data = getAllData();
  const event = data.events[eventId];
  if (!event || !event.slips || event.slips.length === 0) return [];

  event.slips.shift(); // Remove first (most recent)
  saveAllData(data);
  return event.slips;
}

export function removeSlipByIndex(eventId, index) {
  const data = getAllData();
  const event = data.events[eventId];
  if (!event || !event.slips) return [];

  event.slips.splice(index, 1);
  saveAllData(data);
  return event.slips;
}

