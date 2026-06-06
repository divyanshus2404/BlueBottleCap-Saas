import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import dotenv from "dotenv";

// Import all the chapter data
import { studyMaterial } from "./src/data/studyMaterial";
import { extraChapters } from "./src/data/studyMaterialExtra";

dotenv.config({ path: ".env" });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding chapters to Firestore...");
  
  const allChapters = [...studyMaterial, ...extraChapters];
  
  for (const chapter of allChapters) {
    try {
      await addDoc(collection(db, "chapters"), {
        ...chapter,
        createdAt: serverTimestamp()
      });
      console.log(`Added chapter: ${chapter.chapter} (${chapter.subject} Class ${chapter.class})`);
    } catch (err) {
      console.error(`Failed to add chapter: ${chapter.chapter}`, err);
    }
  }
  
  console.log("Done seeding chapters!");
  process.exit(0);
}

seed().catch(console.error);
