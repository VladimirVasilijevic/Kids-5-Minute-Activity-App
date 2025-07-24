const { initializeFirebase, printMessage, formatTimestamp } = require('../shared/config');

async function deleteUser(userId) {
  try {
    const { auth, firestore, displayName } = initializeFirebase('dev');

    printMessage(`🚀 Deleting user in ${displayName} environment...`, 'info');

    // Get user record first
    const userRecord = await auth.getUser(userId);
    printMessage(`✅ Found user: ${userRecord.email}`, 'success');

    // Get user document from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      printMessage(`📊 User data:`, 'info');
      printMessage(`   Email: ${userData.email}`, 'info');
      printMessage(`   Role: ${userData.role}`, 'info');
      printMessage(`   Created: ${formatTimestamp(userData.createdAt)}`, 'info');
    }

    // Delete subscription document if exists
    const subscriptionDoc = await firestore.collection('subscriptions').doc(userId).get();
    if (subscriptionDoc.exists) {
      await firestore.collection('subscriptions').doc(userId).delete();
      printMessage(`✅ Subscription document deleted`, 'success');
    }

    // Delete user document from Firestore
    await firestore.collection('users').doc(userId).delete();
    printMessage(`✅ User document deleted from Firestore`, 'success');

    // Delete user from Authentication
    await auth.deleteUser(userId);
    printMessage(`✅ User deleted from Authentication`, 'success');

    printMessage(`\n🎉 User deleted successfully from ${displayName}!`, 'success');
    printMessage(`Email: ${userRecord.email}`, 'info');
    printMessage(`UID: ${userId}`, 'info');

  } catch (error) {
    printMessage(`❌ Error deleting user: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Get command line arguments
const [,, userId] = process.argv;

if (!userId) {
  printMessage('Usage: node dev/delete-user.js <userId>', 'info');
  printMessage('Example: node dev/delete-user.js abc123', 'info');
  process.exit(1);
}

deleteUser(userId); 