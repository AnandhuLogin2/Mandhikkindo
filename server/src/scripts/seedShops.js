import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, admin } from '../config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedShops = async () => {
  try {
    console.log('🌱 Starting shop seeding process...');
    const jsonPath = path.resolve(__dirname, 'data/shops.json');

    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Data file not found at: ${jsonPath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const shops = JSON.parse(rawData);

    console.log(`📦 Found ${shops.length} shops in data file.`);

    const shopsCollection = db.collection('shops');
    const snapshot = await shopsCollection.get();
    const existingNames = new Set();
    const existingIds = new Set();

    snapshot.forEach((doc) => {
      existingIds.add(doc.id);
      if (doc.data().name) {
        existingNames.add(doc.data().name.toLowerCase().trim());
      }
    });

    let insertedCount = 0;
    let skippedCount = 0;

    // Firestore batch supports up to 500 operations per batch
    let batch = db.batch();
    let operationCount = 0;

    for (const shop of shops) {
      const shopNameKey = shop.name ? shop.name.toLowerCase().trim() : '';

      if (existingNames.has(shopNameKey) || (shop.id && existingIds.has(shop.id))) {
        skippedCount++;
        continue;
      }

      const docRef = shop.id ? shopsCollection.doc(shop.id) : shopsCollection.doc();
      const now = admin.firestore.FieldValue.serverTimestamp();

      const shopData = {
        name: shop.name || '',
        district: shop.district || '',
        location: shop.location || shop.address || '',
        lat: Number(shop.lat) || 0,
        lng: Number(shop.lng) || 0,
        rating: Number(shop.rating) || 0,
        reviews: Number(shop.reviews) || 0,
        types: Array.isArray(shop.types) ? shop.types : [],
        createdAt: now,
        updatedAt: now,
      };

      batch.set(docRef, shopData);
      operationCount++;
      insertedCount++;

      if (operationCount === 400) {
        await batch.commit();
        batch = db.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Seeding completed successfully!`);
    console.log(`   - Inserted: ${insertedCount}`);
    console.log(`   - Skipped (already existing): ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding shops:', error);
    process.exit(1);
  }
};

seedShops();
