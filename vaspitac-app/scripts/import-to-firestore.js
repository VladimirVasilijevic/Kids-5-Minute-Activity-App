const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read JSON files - using the actual file structure
const activitiesEn = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/activities_en.json'), 'utf8'));
const activitiesSr = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/activities_sr.json'), 'utf8'));
const categoriesEn = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/categories_en.json'), 'utf8'));
const categoriesSr = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/categories_sr.json'), 'utf8'));
const blogEn = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/blog-posts_en.json'), 'utf8'));
const blogSr = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/blog-posts_sr.json'), 'utf8'));
const tipsEn = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/tips_en.json'), 'utf8'));
const tipsSr = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/tips_sr.json'), 'utf8'));

async function importData() {
  try {
    console.log('Starting data import to Firestore...');

    // Import activities_en collection
    console.log('Importing activities_en...');
    for (const activity of activitiesEn) {
      await db.collection('activities_en').doc(activity.id).set(activity);
    }

    // Import activities_sr collection
    console.log('Importing activities_sr...');
    for (const activity of activitiesSr) {
      await db.collection('activities_sr').doc(activity.id).set(activity);
    }

    // Import categories_en collection
    console.log('Importing categories_en...');
    for (const category of categoriesEn) {
      await db.collection('categories_en').doc(category.id).set(category);
    }

    // Import categories_sr collection
    console.log('Importing categories_sr...');
    for (const category of categoriesSr) {
      await db.collection('categories_sr').doc(category.id).set(category);
    }

    // Import blog_en collection
    console.log('Importing blog_en...');
    for (const post of blogEn) {
      await db.collection('blog_en').doc(post.id.toString()).set(post);
    }

    // Import blog_sr collection
    console.log('Importing blog_sr...');
    for (const post of blogSr) {
      await db.collection('blog_sr').doc(post.id.toString()).set(post);
    }

    // Import tips_en collection
    console.log('Importing tips_en...');
    for (const tip of tipsEn) {
      await db.collection('tips_en').doc(tip.id.toString()).set(tip);
    }

    // Import tips_sr collection
    console.log('Importing tips_sr...');
    for (const tip of tipsSr) {
      await db.collection('tips_sr').doc(tip.id.toString()).set(tip);
    }

    // Add version metadata
    await db.collection('metadata').doc('version').set({
      version: '1.0.0',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      languages: ['en', 'sr'],
      dataStructure: 'separate-files'
    });

    console.log('✅ Data import completed successfully!');
    console.log(`📊 Imported:`);
    console.log(`   - ${activitiesEn.length} activities (EN)`);
    console.log(`   - ${activitiesSr.length} activities (SR)`);
    console.log(`   - ${categoriesEn.length} categories (EN)`);
    console.log(`   - ${categoriesSr.length} categories (SR)`);
    console.log(`   - ${blogEn.length} blog posts (EN)`);
    console.log(`   - ${blogSr.length} blog posts (SR)`);
    console.log(`   - ${tipsEn.length} tips (EN)`);
    console.log(`   - ${tipsSr.length} tips (SR)`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    process.exit(0);
  }
}

importData(); 