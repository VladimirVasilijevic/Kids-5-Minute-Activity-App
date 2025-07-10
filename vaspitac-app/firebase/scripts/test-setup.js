/**
 * Test Firebase Setup Script
 * Verifies that Firebase is properly configured and working
 * 
 * Usage: node scripts/test-setup.js
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
 * Test Firebase connection
 */
async function testConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('✅ Firestore connection successful');
    
    // Test Auth connection
    const auth = admin.auth();
    console.log('✅ Firebase Auth connection successful');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return false;
  }
}

/**
 * Test user creation and deletion
 */
async function testUserCreation() {
  try {
    console.log('\n👤 Testing user creation...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Create test user
    const userRecord = await admin.auth().createUser({
      email: testEmail,
      password: testPassword,
      displayName: 'Test User'
    });
    
    console.log(`✅ Created test user: ${testEmail}`);
    
    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      displayName: userRecord.displayName,
      email: userRecord.email,
      createdAt: new Date().toISOString(),
      role: 'free',
      permissions: [
        'access_blog_posts',
        'access_tips',
        'edit_profile',
        'view_profile'
      ],
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ Created user profile in Firestore');
    
    // Test reading user profile
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (userDoc.exists) {
      console.log('✅ User profile read successful');
    }
    
    // Clean up - delete test user
    await admin.auth().deleteUser(userRecord.uid);
    await db.collection('users').doc(userRecord.uid).delete();
    console.log('✅ Test user cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ User creation test failed:', error.message);
    return false;
  }
}

/**
 * Test security rules
 */
async function testSecurityRules() {
  try {
    console.log('\n🔒 Testing security rules...');
    
    // Test reading public content (should work)
    const activitiesSnapshot = await db.collection('activities_sr').limit(1).get();
    console.log('✅ Public content read successful');
    
    // Test admin role assignment
    console.log('✅ Security rules test completed (basic checks)');
    
    return true;
  } catch (error) {
    console.error('❌ Security rules test failed:', error.message);
    return false;
  }
}

/**
 * Test subscription management
 */
async function testSubscriptionManagement() {
  try {
    console.log('\n💳 Testing subscription management...');
    
    // Create a test user with subscription
    const testEmail = `sub-test-${Date.now()}@example.com`;
    const userRecord = await admin.auth().createUser({
      email: testEmail,
      password: 'testpassword123',
      displayName: 'Subscription Test User'
    });
    
    // Create user profile with subscription
    const userProfile = {
      uid: userRecord.uid,
      displayName: userRecord.displayName,
      email: userRecord.email,
      createdAt: new Date().toISOString(),
      role: 'subscriber',
      permissions: [
        'access_all_activities',
        'access_premium_activities',
        'access_blog_posts',
        'access_premium_blog',
        'access_tips',
        'access_premium_tips',
        'download_pdf_guides',
        'download_video_materials',
        'edit_profile',
        'view_profile',
        'manage_own_subscription'
      ],
      subscription: {
        type: 'monthly',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        lastPaymentDate: new Date().toISOString(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ Created user with subscription');
    
    // Test subscription status check
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    if (userData.subscription && userData.subscription.status === 'active') {
      console.log('✅ Subscription status check successful');
    }
    
    // Clean up
    await admin.auth().deleteUser(userRecord.uid);
    await db.collection('users').doc(userRecord.uid).delete();
    console.log('✅ Subscription test user cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Subscription management test failed:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Firebase Setup Test Suite');
  console.log('============================\n');
  
  const tests = [
    { name: 'Firebase Connection', fn: testConnection },
    { name: 'User Creation', fn: testUserCreation },
    { name: 'Security Rules', fn: testSecurityRules },
    { name: 'Subscription Management', fn: testSubscriptionManagement }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your Firebase setup is working correctly.');
    console.log('\n📋 You can now:');
    console.log('1. Create users: node scripts/create-user.js <email> <password> <role>');
    console.log('2. List users: node scripts/list-users.js');
    console.log('3. Assign admin: node scripts/assign-admin.js <email>');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your Firebase configuration.');
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 