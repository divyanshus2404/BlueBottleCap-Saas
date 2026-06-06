import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";

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

const mockedSeniorPosts = [
  {
    authorName: "Rahul Sharma",
    authorCredential: "IIT Delhi '24 | AIR 142",
    title: "How I revised Physics in the last 3 months (My exact schedule)",
    content: `A lot of you ask me how to revise Physics when the syllabus feels overwhelming. **The biggest mistake** students make is trying to re-read their theory notes. \n\nDon't do this. \n\nInstead, switch to **Reverse Engineering via Questions**. Pick up a 20-year PYQ book. Start with Mechanics. If you get a question wrong, *then* go read the theory for that specific formula. This will save you 60% of your time. \n\nI've attached my personal short-notes for Rotational Motion below. Notice how I've only written down edge-cases and formulas I used to forget, not everything.`,
    tags: ["Strategy", "Physics", "Revision"],
    upvotes: 428,
    datePosted: "2 days ago"
  },
  {
    authorName: "Sneha Reddy",
    authorCredential: "NIT Trichy '23 | CS",
    title: "The only Inorganic Chemistry trick you need",
    content: `Inorganic chemistry is all about patterns and exceptions. I used to hate it until I realized: **NTA loves to ask exceptions**. \n\nInstead of memorizing the periodic table left-to-right, memorize the blocks by their anomalous behavior. For example, the anomalous properties of second period elements (Li, Be, B) compared to the rest of their group. \n\nI made a flashcard set of every single exception NCERT mentions for p-block. If you guys want it, let me know in the comments and I'll upload the PDF here.`,
    tags: ["Chemistry", "Inorganic", "NCERT"],
    upvotes: 315,
    datePosted: "1 week ago"
  },
  {
    authorName: "Aryan Gupta",
    authorCredential: "IIT Bombay '25",
    title: "Math is killing my score - What should I do?",
    content: `If Math is consistently your lowest scoring subject in mock tests (it was for me too), you need to change your approach. You cannot "guess" or "estimate" your way through JEE Math.\n\n**Focus on these 4 high-weightage, predictable topics first:**\n1. Matrices and Determinants\n2. Vectors and 3D Geometry\n3. Sequence and Series\n4. Applications of Derivatives\n\nIf you master *just* these four, you can easily secure 30-40 marks in JEE Mains Math, which is enough to get a 95+ percentile in that section given the current difficulty trend. Stop trying to master Integral Calculus if you are short on time.`,
    tags: ["Math", "High-Weightage", "Strategy"],
    upvotes: 592,
    datePosted: "3 weeks ago"
  },
  {
    authorName: "Ananya Patel",
    authorCredential: "AIIMS Delhi '26",
    title: "How to deal with burnout during drop year",
    content: `Taking a drop year is mentally exhausting. I remember feeling like everyone else was moving forward in college while I was stuck in the same room.\n\n**My biggest advice:** Treat it like a 9-to-5 job. Wake up at 8 AM, study till 5 PM with proper breaks, and *then stop*. Do not study at 2 AM. Do not pull all-nighters. Your brain needs sleep to consolidate memory. \n\nIf you are feeling burnt out right now, take exactly 2 days off. Don't touch a book. Watch a movie. You won't forget everything in 48 hours, I promise.`,
    tags: ["Mental Health", "Drop Year", "Motivation"],
    upvotes: 841,
    datePosted: "1 month ago"
  }
];

async function seed() {
  console.log("Seeding posts to Firestore...");
  for (const post of mockedSeniorPosts) {
    post.createdAt = new Date().toISOString();
    await addDoc(collection(db, "posts"), post);
    console.log(`Added: ${post.title}`);
  }
  console.log("Done seeding posts!");
  process.exit(0);
}

seed().catch(console.error);
