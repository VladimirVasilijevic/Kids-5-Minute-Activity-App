const fs = require('fs');
const path = require('path');

/**
 * Read JSON file from assets directory
 * @param {string} filePath - Path to JSON file relative to assets
 * @returns {Object|null} Parsed JSON data or null if error
 */
function readJsonFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '../../../src/assets', filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get all available JSON files for import
 * @returns {Object} Object with file paths for each type
 */
function getImportFiles() {
  return {
    activities: {
      en: 'activities_en.json',
      sr: 'activities_sr.json'
    },
    blog: {
      en: 'blog-posts_en.json',
      sr: 'blog-posts_sr.json'
    },
    categories: {
      en: 'categories_en.json',
      sr: 'categories_sr.json'
    },
    about: {
      en: 'about_en.json',
      sr: 'about_sr.json'
    }
  };
}

/**
 * Import activities data
 * @param {Object} firestore - Firestore instance
 * @returns {Object} Import results
 */
async function importActivities(firestore) {
  const files = getImportFiles().activities;
  const results = {};

  // Import English activities
  const activitiesEn = readJsonFile(files.en);
  if (activitiesEn && Array.isArray(activitiesEn)) {
    for (const activity of activitiesEn) {
      await firestore.collection('activities_en').doc(activity.id).set(activity);
    }
    results.en = activitiesEn.length;
  }

  // Import Serbian activities
  const activitiesSr = readJsonFile(files.sr);
  if (activitiesSr && Array.isArray(activitiesSr)) {
    for (const activity of activitiesSr) {
      await firestore.collection('activities_sr').doc(activity.id).set(activity);
    }
    results.sr = activitiesSr.length;
  }

  return results;
}

/**
 * Import blog posts data
 * @param {Object} firestore - Firestore instance
 * @returns {Object} Import results
 */
async function importBlogPosts(firestore) {
  const files = getImportFiles().blog;
  const results = {};

  // Import English blog posts
  const blogEn = readJsonFile(files.en);
  if (blogEn && Array.isArray(blogEn)) {
    for (const post of blogEn) {
      await firestore.collection('blog_en').doc(post.id.toString()).set(post);
    }
    results.en = blogEn.length;
  }

  // Import Serbian blog posts
  const blogSr = readJsonFile(files.sr);
  if (blogSr && Array.isArray(blogSr)) {
    for (const post of blogSr) {
      await firestore.collection('blog_sr').doc(post.id.toString()).set(post);
    }
    results.sr = blogSr.length;
  }

  return results;
}

/**
 * Import categories data
 * @param {Object} firestore - Firestore instance
 * @returns {Object} Import results
 */
async function importCategories(firestore) {
  const files = getImportFiles().categories;
  const results = {};

  // Import English categories
  const categoriesEn = readJsonFile(files.en);
  if (categoriesEn && Array.isArray(categoriesEn)) {
    for (const category of categoriesEn) {
      await firestore.collection('categories_en').doc(category.id).set(category);
    }
    results.en = categoriesEn.length;
  }

  // Import Serbian categories
  const categoriesSr = readJsonFile(files.sr);
  if (categoriesSr && Array.isArray(categoriesSr)) {
    for (const category of categoriesSr) {
      await firestore.collection('categories_sr').doc(category.id).set(category);
    }
    results.sr = categoriesSr.length;
  }

  return results;
}

/**
 * Import about data
 * @param {Object} firestore - Firestore instance
 * @returns {Object} Import results
 */
async function importAbout(firestore) {
  const files = getImportFiles().about;
  const results = {};

  // Import English about
  const aboutEn = readJsonFile(files.en);
  if (aboutEn && aboutEn.data) {
    await firestore.collection('about_en').doc('profile').set(aboutEn.data);
    results.en = 1;
  }

  // Import Serbian about
  const aboutSr = readJsonFile(files.sr);
  if (aboutSr && aboutSr.data) {
    await firestore.collection('about_sr').doc('profile').set(aboutSr.data);
    results.sr = 1;
  }

  return results;
}

/**
 * Get all collections from Firestore
 * @param {Object} firestore - Firestore instance
 * @returns {Object} All collections data
 */
async function getAllCollections(firestore) {
  const collections = {};
  const collectionNames = [
    'users', 'subscriptions', 'activities_en', 'activities_sr',
    'blog_en', 'blog_sr', 'categories_en', 'categories_sr',
    'about_en', 'about_sr', 'metadata'
  ];

  for (const collectionName of collectionNames) {
    try {
      const snapshot = await firestore.collection(collectionName).get();
      collections[collectionName] = [];
      snapshot.forEach(doc => {
        collections[collectionName].push({
          id: doc.id,
          ...doc.data()
        });
      });
    } catch (error) {
      console.warn(`⚠️  Could not read collection ${collectionName}:`, error.message);
      collections[collectionName] = [];
    }
  }

  return collections;
}

/**
 * Backup all data to JSON file
 * @param {Object} firestore - Firestore instance
 * @param {string} outputPath - Path to save backup file
 */
async function backupAllData(firestore, outputPath) {
  const data = await getAllCollections(firestore);
  const backup = {
    timestamp: new Date().toISOString(),
    collections: data
  };

  fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));
  return backup;
}

module.exports = {
  readJsonFile,
  getImportFiles,
  importActivities,
  importBlogPosts,
  importCategories,
  importAbout,
  getAllCollections,
  backupAllData
}; 