const { initializeFirebase, isValidRole, getAvailableRoles, printMessage, USER_ROLES } = require('../shared/config');

async function createUser(email, password, role = USER_ROLES.FREE_USER) {
  try {
    const { auth, firestore, FieldValue, displayName } = initializeFirebase('dev');

    // Validate role
    if (!isValidRole(role)) {
      printMessage(`❌ Invalid role: ${role}`, 'error');
      printMessage(`Available roles: ${getAvailableRoles()}`, 'info');
      process.exit(1);
    }

    printMessage(`🚀 Creating user in ${displayName} environment...`, 'info');

    // Create user in Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false
    });

    printMessage(`✅ User created in Authentication: ${userRecord.uid}`, 'success');

    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role,
      admin: role === USER_ROLES.ADMIN
    });

    printMessage(`✅ Custom claims set: role=${role}, admin=${role === USER_ROLES.ADMIN}`, 'success');

    // Create user document in Firestore
    const userDoc = {
      uid: userRecord.uid,
      email: email,
      role: role,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isActive: true
    };

    await firestore.collection('users').doc(userRecord.uid).set(userDoc);
    printMessage(`✅ User document created in Firestore`, 'success');

    // Create subscription document if needed
    if (role === USER_ROLES.SUBSCRIBER || role === USER_ROLES.TRIAL_USER) {
      const subscriptionDoc = {
        userId: userRecord.uid,
        plan: role,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: role === USER_ROLES.TRIAL_USER 
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for trial
          : null
      };

      await firestore.collection('subscriptions').doc(userRecord.uid).set(subscriptionDoc);
      printMessage(`✅ Subscription document created`, 'success');
    }

    printMessage(`\n🎉 User created successfully in ${displayName}!`, 'success');
    printMessage(`Email: ${email}`, 'info');
    printMessage(`Role: ${role}`, 'info');
    printMessage(`UID: ${userRecord.uid}`, 'info');

  } catch (error) {
    printMessage(`❌ Error creating user: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Get command line arguments
const [,, email, password, role] = process.argv;

if (!email || !password) {
  printMessage('Usage: node dev/create-user.js <email> <password> [role]', 'info');
  printMessage(`Roles: ${getAvailableRoles()}`, 'info');
  printMessage('Example: node dev/create-user.js test@example.com password123 admin', 'info');
  process.exit(1);
}

createUser(email, password, role || USER_ROLES.FREE_USER); 