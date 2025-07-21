const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin for production
const serviceAccount = require('./serviceAccountKey-prod.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ana-vaspitac-prod'
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createUser(email, password, role = 'free') {
  try {
    // Create user in Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false
    });

    console.log(`✅ User created in Authentication: ${userRecord.uid}`);

    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role,
      admin: role === 'admin'
    });

    console.log(`✅ Custom claims set: role=${role}, admin=${role === 'admin'}`);

    // Create user document in Firestore
    const userDoc = {
      uid: userRecord.uid,
      email: email,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };

    await firestore.collection('users').doc(userRecord.uid).set(userDoc);
    console.log(`✅ User document created in Firestore`);

    // Create subscription document if needed
    if (role === 'subscriber' || role === 'trial') {
      const subscriptionDoc = {
        userId: userRecord.uid,
        plan: role,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: role === 'trial' 
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for trial
          : null
      };

      await firestore.collection('subscriptions').doc(userRecord.uid).set(subscriptionDoc);
      console.log(`✅ Subscription document created`);
    }

    console.log(`\n🎉 User created successfully in PRODUCTION!`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`UID: ${userRecord.uid}`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const [,, email, password, role] = process.argv;

if (!email || !password) {
  console.log('Usage: node create-user-prod.js <email> <password> [role]');
  console.log('Roles: free, trial, subscriber, admin');
  console.log('Example: node create-user-prod.js test@example.com password123 admin');
  console.log('\n⚠️  WARNING: This will create a user in PRODUCTION!');
  process.exit(1);
}

console.log('⚠️  WARNING: You are creating a user in PRODUCTION!');
console.log('This will affect live users and data.');
console.log('Are you sure you want to continue? (y/N)');

process.stdin.once('data', (data) => {
  const input = data.toString().trim().toLowerCase();
  if (input === 'y' || input === 'yes') {
    createUser(email, password, role || 'free');
  } else {
    console.log('Operation cancelled.');
    process.exit(0);
  }
}); 