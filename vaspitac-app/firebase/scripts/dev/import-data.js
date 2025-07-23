const { initializeFirebase, isValidImportType, getAvailableImportTypes, printMessage, IMPORT_TYPES } = require('../shared/config');
const { importActivities, importBlogPosts, importCategories, importAbout } = require('../shared/firestore');

async function importData(importType) {
  try {
    const { firestore, FieldValue, displayName } = initializeFirebase('dev');

    // Validate import type
    if (!isValidImportType(importType)) {
      printMessage(`❌ Invalid import type: ${importType}`, 'error');
      printMessage(`Available types: ${getAvailableImportTypes()}`, 'info');
      process.exit(1);
    }

    printMessage(`🚀 Starting data import in ${displayName} environment...`, 'info');
    printMessage(`📊 Import type: ${importType}`, 'info');
    console.log('');

    let totalImported = 0;
    const importResults = {};

    // Import based on type
    if (importType === IMPORT_TYPES.ACTIVITIES || importType === IMPORT_TYPES.ALL) {
      printMessage('📝 Importing activities...', 'info');
      const results = await importActivities(firestore);
      importResults.activities = results;
      totalImported += (results.en || 0) + (results.sr || 0);
      printMessage(`   ✅ Activities (EN): ${results.en || 0}`, 'success');
      printMessage(`   ✅ Activities (SR): ${results.sr || 0}`, 'success');
    }

    if (importType === IMPORT_TYPES.BLOG || importType === IMPORT_TYPES.ALL) {
      printMessage('📰 Importing blog posts...', 'info');
      const results = await importBlogPosts(firestore);
      importResults.blog = results;
      totalImported += (results.en || 0) + (results.sr || 0);
      printMessage(`   ✅ Blog posts (EN): ${results.en || 0}`, 'success');
      printMessage(`   ✅ Blog posts (SR): ${results.sr || 0}`, 'success');
    }

    if (importType === IMPORT_TYPES.CATEGORIES || importType === IMPORT_TYPES.ALL) {
      printMessage('📂 Importing categories...', 'info');
      const results = await importCategories(firestore);
      importResults.categories = results;
      totalImported += (results.en || 0) + (results.sr || 0);
      printMessage(`   ✅ Categories (EN): ${results.en || 0}`, 'success');
      printMessage(`   ✅ Categories (SR): ${results.sr || 0}`, 'success');
    }

    if (importType === IMPORT_TYPES.ABOUT || importType === IMPORT_TYPES.ALL) {
      printMessage('👤 Importing about profiles...', 'info');
      const results = await importAbout(firestore);
      importResults.about = results;
      totalImported += (results.en || 0) + (results.sr || 0);
      printMessage(`   ✅ About (EN): ${results.en || 0}`, 'success');
      printMessage(`   ✅ About (SR): ${results.sr || 0}`, 'success');
    }

    // Add version metadata
    printMessage('📋 Adding metadata...', 'info');
    await firestore.collection('metadata').doc('version').set({
      version: '1.0.0',
      lastUpdated: FieldValue.serverTimestamp(),
      languages: ['en', 'sr'],
      dataStructure: 'imported-from-json-files',
      totalRecords: totalImported,
      importResults: importResults,
      importType: importType
    });

    printMessage('', 'info');
    printMessage(`🎉 Data import completed successfully in ${displayName}!`, 'success');
    printMessage(`📊 Total records imported: ${totalImported}`, 'info');
    printMessage('', 'info');
    printMessage('📋 Summary:', 'info');
    
    if (importResults.activities) {
      printMessage(`   - Activities: ${(importResults.activities.en || 0) + (importResults.activities.sr || 0)}`, 'info');
    }
    if (importResults.blog) {
      printMessage(`   - Blog posts: ${(importResults.blog.en || 0) + (importResults.blog.sr || 0)}`, 'info');
    }
    if (importResults.categories) {
      printMessage(`   - Categories: ${(importResults.categories.en || 0) + (importResults.categories.sr || 0)}`, 'info');
    }
    if (importResults.about) {
      printMessage(`   - About profiles: ${(importResults.about.en || 0) + (importResults.about.sr || 0)}`, 'info');
    }

  } catch (error) {
    printMessage(`❌ Error importing data: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Get command line arguments
const [,, importType] = process.argv;

if (!importType) {
  printMessage('Usage: node dev/import-data.js <type>', 'info');
  printMessage(`Types: ${getAvailableImportTypes()}`, 'info');
  printMessage('Examples:', 'info');
  printMessage('  node dev/import-data.js activities', 'info');
  printMessage('  node dev/import-data.js blog', 'info');
  printMessage('  node dev/import-data.js categories', 'info');
  printMessage('  node dev/import-data.js about', 'info');
  printMessage('  node dev/import-data.js all', 'info');
  process.exit(1);
}

importData(importType); 