import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ===== Models ===== */
import User from "../lib/models/User.js";
import Student from "../lib/models/Student.js";
import Teacher from "../lib/models/Teacher.js";
import Subject from "../lib/models/Subject.js";
import Class from "../lib/models/Class.js";
import Timetable from "../lib/models/Timetable.js";
import Assignment from "../lib/models/Assignment.js";
import Notice from "../lib/models/Notice.js";

/* ===== Path setup ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI =
  "mongodb+srv://Sumit:SumitDb112234@cluster0.tvbous1.mongodb.net/school?retryWrites=true&w=majority";
const SEED_DATA_DIR = path.join(__dirname, "./seed-data");

/* ===== Collection → Model mapping ===== */
const modelMap = {
  users: User,
  students: Student,
  teachers: Teacher
};
// const modelMap = {
//   users: User,
//   students: Student,
//   teachers: Teacher,
//   subjects: Subject,
//   classes: Class,
//   timetables: Timetable,
//   assignments: Assignment,
//   notices: Notice,
// };

async function seedDatabase() {
  try {
    console.log("[v1] Connecting to MongoDB (Mongoose)...");
    await mongoose.connect(MONGODB_URI);

    console.log("[v1] MongoDB connected");
    console.log("[v1] Starting seeding...\n");

    for (const [collectionName, Model] of Object.entries(modelMap)) {
      const filePath = path.join(SEED_DATA_DIR, `${collectionName}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${collectionName}.json not found, skipping...`);
        continue;
      }

      const existingCount = await Model.countDocuments();
      if (existingCount > 0) {
        console.log(
          `⏭️  ${collectionName}: already has ${existingCount} documents, skipping`
        );
        continue;
      }

      const rawData = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(rawData);

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`⚠️  ${collectionName}: no data to insert`);
        continue;
      }

      // 🔥 IMPORTANT: normalize data BEFORE saving
//   for (const doc of data) {

//   /* ================= USERS ================= */
//   if (collectionName === "users") {
//     if (!doc.name) {
//       doc.name = `${doc.firstName || ""} ${doc.lastName || ""}`.trim();
//     }

//     if (!doc.name) {
//       throw new Error(`User ${doc.email} has no name`);
//     }

//     await Model.create(doc);
//     continue;
//   }

//   /* ================= STUDENTS ================= */
//   if (collectionName === "students") {
//     if (!doc.email) {
//       throw new Error("Student record missing email");
//     }

//     const user = await User.findOne({ email: doc.email });
//     if (!user) {
//       throw new Error(`No user found for student email: ${doc.email}`);
//     }

//     doc.user = user._id;

//     // Ensure studentId exists
//     if (!doc.studentId && doc.enrollmentNumber) {
//       doc.studentId = doc.enrollmentNumber;
//     }

//     if (!doc.studentId) {
//       throw new Error(`Student ${doc.email} missing studentId`);
//     }

//     await Student.create(doc);
//     continue;
//   }

//   /* ================= TEACHERS ================= */
//   if (collectionName === "teachers") {
//     if (!doc.email) {
//       throw new Error("Teacher record missing email");
//     }

//     const user = await User.findOne({ email: doc.email });
//     if (!user) {
//       throw new Error(`No user found for teacher email: ${doc.email}`);
//     }

//     doc.user = user._id;

//     await Teacher.create(doc);
//     continue;
//   }

//   /* ================= OTHERS ================= */
//   await Model.create(doc);
// }


      console.log(`✅ ${collectionName}: inserted ${data.length} documents`);
    }

    console.log("\n[v1] Seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[v1] MongoDB disconnected");
  }
}

seedDatabase();


// import { MongoClient } from 'mongodb';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const MONGODB_URI = ''
// const SEED_DATA_DIR = path.join(__dirname, './seed-data');

// const collections = [
//   'subjects',
//   'classes',
//   'users',
//   'students',
//   'teachers',
//   'timetables',
//     'assignments',
//     'notices',
// ];

// async function seedDatabase() {
//   const client = new MongoClient(MONGODB_URI);

//   try {
//     console.log('[v0] Connecting to MongoDB...');
//     await client.connect();
//     const db = client.db();

//     console.log('[v0] Starting database seeding...\n');

//     for (const collectionName of collections) {
//       const filePath = path.join(SEED_DATA_DIR, `${collectionName}.json`);

//       if (!fs.existsSync(filePath)) {
//         console.log(`⚠️  ${collectionName}.json not found, skipping...`);
//         continue;
//       }

//       try {
//         const fileContent = fs.readFileSync(filePath, 'utf-8');
//         const data = JSON.parse(fileContent);

//         // Check if collection exists and is not empty
//         const collection = db.collection(collectionName);
//         const existingCount = await collection.countDocuments();

//         if (existingCount > 0) {
//           console.log(
//             `⏭️  ${collectionName}: Already has ${existingCount} documents, skipping...`
//           );
//           continue;
//         }

//         // Insert data
//         if (Array.isArray(data) && data.length > 0) {
//           const result = await collection.insertMany(data);
//           console.log(
//             `✅ ${collectionName}: Inserted ${result.insertedIds.length} documents`
//           );
//         } else {
//           console.log(`⚠️  ${collectionName}: No data to insert`);
//         }
//       } catch (error) {
//         console.error(`❌ Error seeding ${collectionName}:`, error.message);
//       }
//     }

//     console.log('\n[v0] Database seeding completed!');
//     console.log(
//       '[v0] Created indexes for better query performance...'
//     );

//     // Create indexes
//     await createIndexes(db);

//     console.log('[v0] All setup complete!');
//   } catch (error) {
//     console.error('[v0] Fatal error:', error);
//     process.exit(1);
//   } finally {
//     await client.close();
//   }
// }

// async function createIndexes(db) {
//   try {
//     // Users indexes
//     await db.collection('users').createIndex({ email: 1 }, { unique: true });
//     await db.collection('users').createIndex({ role: 1 });

//     // Students indexes
//     await db.collection('students').createIndex({ enrollmentNumber: 1 }, { unique: true });
//     await db.collection('students').createIndex({ userId: 1 });
//     await db.collection('students').createIndex({ classId: 1 });

//     // Teachers indexes
//     await db.collection('teachers').createIndex({ employeeId: 1 }, { unique: true });
//     await db.collection('teachers').createIndex({ userId: 1 });

//     // Classes indexes
//     await db.collection('classes').createIndex({ name: 1 });

//     // Other indexes
//     await db.collection('subjects').createIndex({ code: 1 });
//     await db.collection('assignments').createIndex({ classId: 1, dueDate: 1 });
//     await db.collection('grades').createIndex({ studentId: 1, subjectId: 1 });
//     await db.collection('attendance').createIndex({ classId: 1, date: 1 });

//     console.log('✅ Indexes created successfully');
//   } catch (error) {
//     console.error('⚠️  Error creating indexes:', error.message);
//   }
// }

// seedDatabase().catch(console.error);
