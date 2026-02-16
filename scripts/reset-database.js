import mongoose from "mongoose";

const MONGODB_URI =
 ''

console.log(`[v1] MongoDB URI: ${MONGODB_URI}`);

const collections = [
  "subjects",
  "classes",
  "users",
  "students",
  "teachers",
  "timetables",
  "assignments",
  "grades",
  "attendance",
  "materials",
  "messages",
  "notices",
  "quizzes",
  "quizAttempts",
  "tickets",
  "settings",
];

async function resetDatabase() {
  try {
    console.log("[v1] Connecting to MongoDB (Mongoose)...");
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.db;

    console.log("[v1] Database connected");
    console.log("⚠️  WARNING: This will DELETE ALL DATA\n");

    let totalDeleted = 0;

    for (const collectionName of collections) {
      const exists = await db
        .listCollections({ name: collectionName })
        .hasNext();

      if (!exists) {
        console.log(`ℹ️  ${collectionName}: collection not found (skipped)`);
        continue;
      }

      const result = await db
        .collection(collectionName)
        .deleteMany({});

      console.log(
        `✅ ${collectionName}: deleted ${result.deletedCount} documents`
      );

      totalDeleted += result.deletedCount;
    }

    console.log(
      `\n✅ Database reset complete! Deleted ${totalDeleted} total documents`
    );
    console.log("[v1] Next: run seed.js to repopulate data");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[v1] MongoDB disconnected");
  }
}

resetDatabase();


// import { MongoClient } from 'mongodb';

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_db';
// console.log(`[v0] MongoDB URI: ${MONGODB_URI}`);

// const collections = [
//   'subjects',
//   'classes',
//   'users',
//   'students',
//   'teachers',
//   'timetables',
//   'assignments',
//   'grades',
//   'attendance',
//   'materials',
//   'messages',
//   'notices',
//   'quizzes',
//   'quizAttempts',
//   'tickets',
//   'settings',
// ];

// async function resetDatabase() {
//   const client = new MongoClient(MONGODB_URI);

//   try {
//     console.log('[v0] Connecting to MongoDB...');
//     await client.connect();
//     const db = client.db();

//     console.log('[v0] Starting database reset...\n');
//     console.log('⚠️  WARNING: This will delete ALL data from the database!\n');

//     let deletedCount = 0;

//     for (const collectionName of collections) {
//       try {
//         const collection = db.collection(collectionName);
//         const result = await collection.deleteMany({});
//         if (result.deletedCount > 0) {
//           console.log(`✅ ${collectionName}: Deleted ${result.deletedCount} documents`);
//           deletedCount += result.deletedCount;
//         }
//       } catch (error) {
//         // Collection might not exist, that's okay
//         console.log(`ℹ️  ${collectionName}: Collection not found (skipped)`);
//       }
//     }

//     console.log(`\n✅ Database reset complete! Deleted ${deletedCount} total documents.`);
//     console.log('[v0] Run: node scripts/seed-database.js to repopulate data');
//   } catch (error) {
//     console.error('[v0] Fatal error:', error);
//     process.exit(1);
//   } finally {
//     await client.close();
//   }
// }

// resetDatabase().catch(console.error);
