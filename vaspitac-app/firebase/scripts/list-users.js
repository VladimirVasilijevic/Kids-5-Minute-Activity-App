/**
 * List Users Script
 * Lists all users in Firestore with their roles and subscription status
 * 
 * Usage: node scripts/list-users.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if service account key exists
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found!');
  console.log('📋 To get your service account key:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save as scripts/serviceAccountKey.json');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get subscription status with color
 * @param {Object} subscription - Subscription object
 * @returns {string} Formatted subscription status
 */
function getSubscriptionStatus(subscription) {
  if (!subscription) return '❌ No subscription';
  
  const now = new Date();
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
  
  if (subscription.status === 'active' || subscription.status === 'trial') {
    if (endDate && endDate < now) {
      return '⚠️ Expired';
    }
    return '✅ Active';
  }
  
  if (subscription.status === 'expired') return '❌ Expired';
  if (subscription.status === 'cancelled') return '🚫 Cancelled';
  
  return `❓ ${subscription.status}`;
}

/**
 * Get days remaining for subscription
 * @param {Object} subscription - Subscription object
 * @returns {string} Days remaining or status
 */
function getDaysRemaining(subscription) {
  if (!subscription || !subscription.endDate) return 'N/A';
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires today';
  return `${diffDays} days`;
}

/**
 * List all users with their details
 */
async function listUsers() {
  try {
    console.log('📋 Fetching users from Firestore...\n');
    
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore');
      return;
    }
    
    console.log(`✅ Found ${usersSnapshot.size} users:\n`);
    console.log('─'.repeat(120));
    console.log('│ Email'.padEnd(30) + '│ Role'.padEnd(12) + '│ Subscription'.padEnd(15) + '│ Days Left'.padEnd(12) + '│ Created'.padEnd(20) + '│ UID'.padEnd(28) + '│');
    console.log('─'.repeat(120));
    
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort users by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    users.forEach(user => {
      const email = (user.email || 'N/A').padEnd(30);
      const role = (user.role || 'none').padEnd(12);
      const subscription = getSubscriptionStatus(user.subscription).padEnd(15);
      const daysLeft = getDaysRemaining(user.subscription).padEnd(12);
      const created = formatDate(user.createdAt).padEnd(20);
      const uid = user.id.padEnd(28);
      
      console.log(`│ ${email}│ ${role}│ ${subscription}│ ${daysLeft}│ ${created}│ ${uid}│`);
    });
    
    console.log('─'.repeat(120));
    
    // Summary statistics
    const roleCounts = {};
    const subscriptionCounts = {};
    
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      
      if (user.subscription) {
        const status = getSubscriptionStatus(user.subscription).replace(/[✅❌⚠️🚫❓]/g, '').trim();
        subscriptionCounts[status] = (subscriptionCounts[status] || 0) + 1;
      } else {
        subscriptionCounts['No subscription'] = (subscriptionCounts['No subscription'] || 0) + 1;
      }
    });
    
    console.log('\n📊 Summary:');
    console.log('Roles:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
    
    console.log('\nSubscriptions:');
    Object.entries(subscriptionCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} users`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  }
}

/**
 * List users by role
 * @param {string} role - Role to filter by
 */
async function listUsersByRole(role) {
  try {
    console.log(`📋 Fetching users with role: ${role}...\n`);
    
    const usersSnapshot = await db.collection('users')
      .where('role', '==', role)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`❌ No users found with role: ${role}`);
      return;
    }
    
    console.log(`✅ Found ${usersSnapshot.size} users with role '${role}':\n`);
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`👤 ${user.displayName || user.email}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UID: ${doc.id}`);
      console.log(`   Created: ${formatDate(user.createdAt)}`);
      
      if (user.subscription) {
        console.log(`   Subscription: ${getSubscriptionStatus(user.subscription)}`);
        console.log(`   Days remaining: ${getDaysRemaining(user.subscription)}`);
      }
      
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error listing users by role:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  const role = process.argv[2];
  
  if (role) {
    await listUsersByRole(role);
  } else {
    await listUsers();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { listUsers, listUsersByRole }; 