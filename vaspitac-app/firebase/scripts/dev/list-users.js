const { initializeFirebase, printMessage, formatTimestamp } = require('../shared/config');

async function listUsers() {
  try {
    const { auth, firestore, displayName } = initializeFirebase('dev');

    printMessage(`🚀 Listing users in ${displayName} environment...`, 'info');

    // Get all users from Authentication
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;

    printMessage(`📊 Found ${authUsers.length} users in Authentication`, 'success');

    // Get all user documents from Firestore
    const usersSnapshot = await firestore.collection('users').get();
    const firestoreUsers = {};
    usersSnapshot.forEach(doc => {
      firestoreUsers[doc.id] = doc.data();
    });

    // Get all subscription documents
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
    const subscriptions = {};
    subscriptionsSnapshot.forEach(doc => {
      subscriptions[doc.id] = doc.data();
    });

    // Combine data
    const users = authUsers.map(authUser => {
      const firestoreUser = firestoreUsers[authUser.uid] || {};
      const subscription = subscriptions[authUser.uid] || {};
      
      return {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        emailVerified: authUser.emailVerified,
        disabled: authUser.disabled,
        role: firestoreUser.role || 'unknown',
        isActive: firestoreUser.isActive !== false,
        createdAt: firestoreUser.createdAt,
        updatedAt: firestoreUser.updatedAt,
        lastSignInTime: authUser.metadata.lastSignInTime,
        creationTime: authUser.metadata.creationTime,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          expiresAt: subscription.expiresAt
        },
        customClaims: authUser.customClaims || {}
      };
    });

    // Sort by creation time (newest first)
    users.sort((a, b) => {
      const timeA = a.creationTime ? new Date(a.creationTime).getTime() : 0;
      const timeB = b.creationTime ? new Date(b.creationTime).getTime() : 0;
      return timeB - timeA;
    });

    // Print summary
    printMessage('', 'info');
    printMessage('📋 User Summary:', 'info');
    printMessage(`   Total Users: ${users.length}`, 'info');
    
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    Object.entries(roleCounts).forEach(([role, count]) => {
      printMessage(`   ${role}: ${count}`, 'info');
    });

    // Print detailed user list
    printMessage('', 'info');
    printMessage('👥 Detailed User List:', 'info');
    console.log(JSON.stringify(users, null, 2));

  } catch (error) {
    printMessage(`❌ Error listing users: ${error.message}`, 'error');
    process.exit(1);
  }
}

listUsers(); 