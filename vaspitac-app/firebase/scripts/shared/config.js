const admin = require('firebase-admin');
const path = require('path');

// Environment configuration
const ENV_CONFIG = {
  dev: {
    projectId: 'ana-vaspitac-dev',
    serviceAccountPath: './serviceAccountKey-dev.json',
    displayName: 'Development'
  },
  prod: {
    projectId: 'ana-vaspitac-prod-e7ee4',
    serviceAccountPath: './serviceAccountKey-prod.json',
    displayName: 'Production'
  }
};

// User roles from the enum
const USER_ROLES = {
  ADMIN: 'admin',
  SUBSCRIBER: 'subscriber', 
  TRIAL_USER: 'trial',
  FREE_USER: 'free'
};

// Subscription statuses
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  TRIAL: 'trial'
};

// Import types
const IMPORT_TYPES = {
  ACTIVITIES: 'activities',
  BLOG: 'blog',
  CATEGORIES: 'categories',
  ABOUT: 'about',
  ALL: 'all'
};

/**
 * Initialize Firebase Admin SDK for specified environment
 * @param {string} env - 'dev' or 'prod'
 * @returns {Object} Firebase admin instance
 */
function initializeFirebase(env) {
  if (!ENV_CONFIG[env]) {
    throw new Error(`Invalid environment: ${env}. Use 'dev' or 'prod'`);
  }

  const config = ENV_CONFIG[env];
  const serviceAccount = require(config.serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: config.projectId
  });

  console.log(`🔧 Initialized Firebase for ${config.displayName} environment`);
  console.log(`📊 Project: ${config.projectId}`);
  console.log('');

  return {
    auth: admin.auth(),
    firestore: admin.firestore(),
    FieldValue: admin.firestore.FieldValue,
    projectId: config.projectId,
    displayName: config.displayName
  };
}

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid
 */
function isValidRole(role) {
  return Object.values(USER_ROLES).includes(role);
}

/**
 * Validate import type
 * @param {string} type - Import type to validate
 * @returns {boolean} True if valid
 */
function isValidImportType(type) {
  return Object.values(IMPORT_TYPES).includes(type);
}

/**
 * Get available roles as string
 * @returns {string} Comma-separated roles
 */
function getAvailableRoles() {
  return Object.values(USER_ROLES).join(', ');
}

/**
 * Get available import types as string
 * @returns {string} Comma-separated import types
 */
function getAvailableImportTypes() {
  return Object.values(IMPORT_TYPES).join(', ');
}

/**
 * Format timestamp for display
 * @param {Date} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

/**
 * Print colored output
 * @param {string} message - Message to print
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function printMessage(message, type = 'info') {
  const colors = {
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    info: '\x1b[36m'     // Cyan
  };
  
  const reset = '\x1b[0m';
  const color = colors[type] || colors.info;
  
  console.log(`${color}${message}${reset}`);
}

module.exports = {
  initializeFirebase,
  isValidRole,
  isValidImportType,
  getAvailableRoles,
  getAvailableImportTypes,
  formatTimestamp,
  printMessage,
  USER_ROLES,
  SUBSCRIPTION_STATUS,
  IMPORT_TYPES,
  ENV_CONFIG
}; 