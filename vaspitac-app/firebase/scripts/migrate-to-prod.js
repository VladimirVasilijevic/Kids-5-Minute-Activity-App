const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin for source project (current)
const sourceServiceAccount = require('./serviceAccountKey.json');

const sourceApp = admin.initializeApp({
  credential: admin.credential.cert(sourceServiceAccount),
  projectId: 'ana-vaspitac'
}, 'source');

// Initialize Firebase Admin for destination project (production)
const destServiceAccount = require('./serviceAccountKey-prod.json');

const destApp = admin.initializeApp({
  credential: admin.credential.cert(destServiceAccount),
  projectId: 'ana-vaspitac-prod'
}, 'destination');

const sourceDb = sourceApp.firestore();
const destDb = destApp.firestore();

async function migrateCollection(collectionName, batchSize = 500) {
  console.log(`\n🔄 Migrating collection: ${collectionName}`);
  
  try {
    // Get all documents from source
    const snapshot = await sourceDb.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`   ⚠️  Collection ${collectionName} is empty, skipping...`);
      return;
    }
    
    console.log(`   📊 Found ${snapshot.size} documents`);
    
    // Process in batches
    const batches = [];
    let currentBatch = destDb.batch();
    let operationCount = 0;
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      
      // Handle special cases for different collections
      let processedData = { ...data };
      
      // Convert Firestore Timestamps to server timestamps for creation dates
      if (data.createdAt && data.createdAt.toDate) {
        processedData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }
      if (data.updatedAt && data.updatedAt.toDate) {
        processedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      }
      
      // Handle arrays and nested objects
      processedData = JSON.parse(JSON.stringify(processedData));
      
      currentBatch.set(destDb.collection(collectionName).doc(doc.id), processedData);
      operationCount++;
      
      if (operationCount >= batchSize) {
        batches.push(currentBatch);
        currentBatch = destDb.batch();
        operationCount = 0;
      }
    });
    
    // Add the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    console.log(`   📦 Committing ${batches.length} batches...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`   ✅ Batch ${i + 1}/${batches.length} committed`);
    }
    
    console.log(`   🎉 Successfully migrated ${snapshot.size} documents from ${collectionName}`);
    
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    throw error;
  }
}

async function migrateUsers() {
  console.log('\n👥 Migrating users...');
  
  try {
    // Get all users from source project
    const sourceAuth = sourceApp.auth();
    const destAuth = destApp.auth();
    
    const listUsersResult = await sourceAuth.listUsers();
    console.log(`   📊 Found ${listUsersResult.users.length} users`);
    
    for (const user of listUsersResult.users) {
      try {
        // Create user in destination project
        const userRecord = await destAuth.createUser({
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          disabled: user.disabled
        });
        
        // Copy custom claims if they exist
        if (user.customClaims) {
          await destAuth.setCustomUserClaims(userRecord.uid, user.customClaims);
        }
        
        console.log(`   ✅ Migrated user: ${user.email} (${userRecord.uid})`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  User already exists: ${user.email}`);
        } else {
          console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
        }
      }
    }
    
    console.log('   🎉 User migration completed');
    
  } catch (error) {
    console.error('   ❌ Error in user migration:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Firebase Data Migration to Production');
  console.log('================================================');
  console.log('Source: ana-vaspitac (current)');
  console.log('Destination: ana-vaspitac-prod (production)');
  console.log('');
  
  // Confirm migration
  console.log('⚠️  WARNING: This will migrate ALL data to PRODUCTION!');
  console.log('This operation cannot be undone.');
  console.log('');
  
  // List collections to migrate
  const collections = [
    'users',
    'activities', 
    'categories',
    'blog-posts',
    'subscriptions',
    'admin',
    'analytics'
  ];
  
  console.log('Collections to migrate:');
  collections.forEach(col => console.log(`   - ${col}`));
  console.log('');
  
  try {
    // Migrate Firestore collections
    for (const collection of collections) {
      await migrateCollection(collection);
    }
    
    // Migrate users (Authentication)
    await migrateUsers();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Firebase Console (Production project)');
    console.log('2. Test the production environment');
    console.log('3. Update GitHub environment secrets with production values');
    console.log('4. Deploy to production when ready');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    await sourceApp.delete();
    await destApp.delete();
  }
}

// Run migration
main(); 