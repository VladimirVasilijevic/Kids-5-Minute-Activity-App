const { initializeFirebase, printMessage } = require('../shared/config');
const { backupAllData } = require('../shared/firestore');
const fs = require('fs');
const path = require('path');

async function backupData(outputPath) {
  try {
    const { firestore, displayName } = initializeFirebase('dev');

    printMessage(`🚀 Starting data backup in ${displayName} environment...`, 'info');

    // Create backup directory if it doesn't exist
    const backupDir = path.dirname(outputPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      printMessage(`📁 Created backup directory: ${backupDir}`, 'success');
    }

    // Perform backup
    const backup = await backupAllData(firestore, outputPath);

    printMessage(`✅ Backup completed successfully!`, 'success');
    printMessage(`📁 Backup saved to: ${outputPath}`, 'info');
    printMessage(`📊 Backup timestamp: ${backup.timestamp}`, 'info');
    printMessage(`📋 Collections backed up: ${Object.keys(backup.collections).length}`, 'info');

    // Print collection summary
    printMessage('', 'info');
    printMessage('📋 Collection Summary:', 'info');
    Object.entries(backup.collections).forEach(([collectionName, documents]) => {
      printMessage(`   ${collectionName}: ${documents.length} documents`, 'info');
    });

  } catch (error) {
    printMessage(`❌ Error backing up data: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Get command line arguments
const [,, outputPath] = process.argv;

if (!outputPath) {
  const defaultPath = `./backups/backup-${new Date().toISOString().split('T')[0]}.json`;
  printMessage('Usage: node dev/backup-data.js [outputPath]', 'info');
  printMessage(`Default: ${defaultPath}`, 'info');
  printMessage('Example: node dev/backup-data.js ./my-backup.json', 'info');
  backupData(defaultPath);
} else {
  backupData(outputPath);
} 