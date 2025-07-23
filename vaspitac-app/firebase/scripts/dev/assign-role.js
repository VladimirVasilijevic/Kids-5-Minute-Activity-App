const { initializeFirebase, isValidRole, getAvailableRoles, printMessage, USER_ROLES } = require('../shared/config');

async function assignRole(userId, newRole) {
  try {
    const { auth, firestore, FieldValue, displayName } = initializeFirebase('dev');

    // Validate role
    if (!isValidRole(newRole)) {
      printMessage(`❌ Invalid role: ${newRole}`, 'error');
      printMessage(`Available roles: ${getAvailableRoles()}`, 'info');
      process.exit(1);
    }

    printMessage(`🚀 Assigning role in ${displayName} environment...`, 'info');

    // Get user record
    const userRecord = await auth.getUser(userId);
    printMessage(`✅ Found user: ${userRecord.email}`, 'success');

    // Set custom claims for role
    await auth.setCustomUserClaims(userId, {
      role: newRole,
      admin: newRole === USER_ROLES.ADMIN
    });

    printMessage(`✅ Custom claims updated: role=${newRole}, admin=${newRole === USER_ROLES.ADMIN}`, 'success');

    // Update user document in Firestore
    await firestore.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: FieldValue.serverTimestamp()
    });

    printMessage(`✅ User document updated in Firestore`, 'success');

    // Update subscription if needed
    if (newRole === USER_ROLES.SUBSCRIBER || newRole === USER_ROLES.TRIAL_USER) {
      const subscriptionDoc = {
        userId: userId,
        plan: newRole,
        status: 'active',
        updatedAt: FieldValue.serverTimestamp(),
        expiresAt: newRole === USER_ROLES.TRIAL_USER 
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for trial
          : null
      };

      await firestore.collection('subscriptions').doc(userId).set(subscriptionDoc, { merge: true });
      printMessage(`✅ Subscription document updated`, 'success');
    }

    printMessage(`\n🎉 Role assigned successfully in ${displayName}!`, 'success');
    printMessage(`User: ${userRecord.email}`, 'info');
    printMessage(`New Role: ${newRole}`, 'info');
    printMessage(`UID: ${userId}`, 'info');

  } catch (error) {
    printMessage(`❌ Error assigning role: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Get command line arguments
const [,, userId, newRole] = process.argv;

if (!userId || !newRole) {
  printMessage('Usage: node dev/assign-role.js <userId> <role>', 'info');
  printMessage(`Roles: ${getAvailableRoles()}`, 'info');
  printMessage('Example: node dev/assign-role.js abc123 admin', 'info');
  process.exit(1);
}

assignRole(userId, newRole); 