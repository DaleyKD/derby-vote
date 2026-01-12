// Troop configuration management
import troopConfigJson from '../troop-config.json';

const DEFAULT_CONFIG = {
  troopState: 'TX',
  troopNumber: '0000',
  troopCity: '',
  charterOrg: '',
  troopWebsite: '',
  charterWebsite: ''
};

let cachedConfig = null;

/**
 * Load troop configuration from imported JSON
 * @returns {Object} The validated configuration object
 */
export function loadTroopConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = validateConfig(troopConfigJson);
    return cachedConfig;
  } catch (error) {
    console.error('Error loading troop config:', error);
    cachedConfig = { ...DEFAULT_CONFIG };
    return cachedConfig;
  }
}

/**
 * Validate and normalize the configuration
 * @param {Object} config - Raw configuration object
 * @returns {Object} Validated configuration
 */
function validateConfig(config) {
  const validated = { ...DEFAULT_CONFIG };

  // Validate troopState (2 uppercase letters)
  if (config.troopState && typeof config.troopState === 'string') {
    const state = config.troopState.trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(state)) {
      validated.troopState = state;
    } else {
      console.warn(`Invalid troopState: ${config.troopState}, using default`);
    }
  }

  // Validate troopNumber (4 digits)
  if (config.troopNumber) {
    const number = String(config.troopNumber).trim();
    if (/^\d{4}$/.test(number)) {
      validated.troopNumber = number;
    } else {
      console.warn(`Invalid troopNumber: ${config.troopNumber}, must be 4 digits`);
    }
  }

  // Optional troopCity
  if (config.troopCity && typeof config.troopCity === 'string') {
    validated.troopCity = config.troopCity.trim();
  }

  // Optional charterOrg
  if (config.charterOrg && typeof config.charterOrg === 'string') {
    validated.charterOrg = config.charterOrg.trim();
  }

  // Optional troopWebsite (validate URL format)
  if (config.troopWebsite && typeof config.troopWebsite === 'string') {
    const url = config.troopWebsite.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      validated.troopWebsite = url;
    } else if (url) {
      console.warn(`Invalid troopWebsite: ${url}, must start with http:// or https://`);
    }
  }

  // Optional charterWebsite (validate URL format)
  if (config.charterWebsite && typeof config.charterWebsite === 'string') {
    const url = config.charterWebsite.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      validated.charterWebsite = url;
    } else if (url) {
      console.warn(`Invalid charterWebsite: ${url}, must start with http:// or https://`);
    }
  }

  return validated;
}

/**
 * Get the formatted troop identifier (e.g., "TX-0521")
 * @param {Object} config - Configuration object
 * @returns {string} Formatted troop identifier
 */
export function getTroopIdentifier(config) {
  return `${config.troopState}-${config.troopNumber}`;
}

/**
 * Get the formatted location string (e.g., "Dallas, TX" or just "TX")
 * @param {Object} config - Configuration object
 * @returns {string} Formatted location
 */
export function getTroopLocation(config) {
  if (config.troopCity) {
    return `${config.troopCity}, ${config.troopState}`;
  }
  return config.troopState;
}

/**
 * Get the full troop display string with optional charter org
 * @param {Object} config - Configuration object
 * @returns {string} Full display string
 */
export function getTroopDisplayString(config) {
  const parts = [];
  
  if (config.charterOrg) {
    parts.push(config.charterOrg);
  }
  
  if (config.troopCity) {
    parts.push(`${config.troopCity}, ${config.troopState}`);
  } else {
    parts.push(config.troopState);
  }
  
  return parts.join(' • ');
}

/**
 * Clear the cached configuration (useful for testing or reloading)
 */
export function clearConfigCache() {
  cachedConfig = null;
}

