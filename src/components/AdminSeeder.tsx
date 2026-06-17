import React, { useState } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { jeePyqData } from "../data/jeePyqs";
import { repeatedTestsData } from "../data/repeatedJeePyqs";
import { Database, UploadCloud, CheckCircle } from "lucide-react";

export function AdminSeeder() {
  const [status, setStatus] = useState<"idle" | "seeding" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleSeed = async () => {
    if (!window.confirm("Are you sure you want to seed the database? This may overwrite existing mock tests and questions.")) return;
    
    setStatus("seeding");
    setLogs(["Starting database seeding..."]);

    try {
      // 1. Seed Subjects, Chapters, and Questions
      addLog(`Found ${jeePyqData.length} subjects to seed.`);
      for (const subject of jeePyqData) {
        const subjectRef = doc(db, "jee_subjects", subject.name.toLowerCase());
        await setDoc(subjectRef, { name: subject.name });
        addLog(`Created subject: ${subject.name}`);

        for (const chapter of subject.chapters) {
          const chapterRef = doc(db, `jee_subjects/${subject.name.toLowerCase()}/chapters`, chapter.name.replace(/\s+/g, '-').toLowerCase());
          await setDoc(chapterRef, { name: chapter.name });
          
          // Batch upload questions for this chapter
          const batch = writeBatch(db);
          chapter.questions.forEach(q => {
            const qRef = doc(db, `jee_subjects/${subject.name.toLowerCase()}/chapters/${chapter.name.replace(/\s+/g, '-').toLowerCase()}/questions`, q.id);
            batch.set(qRef, {
              year: q.year,
              question: q.question,
              options: q.options,
              answer: q.answer,
              hints: q.hints,
              solution: q.solution,
              commonMistakes: q.commonMistakes
            });
          });
          await batch.commit();
          addLog(`  -> Uploaded ${chapter.questions.length} questions for ${chapter.name}`);
        }
      }

      // 2. Seed Mock Tests
      addLog(`Found ${repeatedTestsData.length} mock tests to seed.`);
      const testBatch = writeBatch(db);
      repeatedTestsData.forEach(test => {
        const testRef = doc(db, "jee_mock_tests", test.id);
        testBatch.set(testRef, {
          name: test.name,
          type: test.type,
          subject: test.subject,
          questions: test.questions // storing full objects for simplicity of prototype
        });
      });
      await testBatch.commit();
      addLog("Successfully uploaded all mock tests.");

      setStatus("success");
      addLog("Seeding complete! You can now remove this component.");
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      addLog(`Error: ${error.message}. Check Firestore security rules.`);
    }
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl max-w-2xl mx-auto my-8 border border-slate-700 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-brand-sky" />
        <h3 className="text-xl font-bold">Database Migration Tool</h3>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Click below to migrate local hardcoded `jeePyqs.ts` and `repeatedJeePyqs.ts` data to your Firebase Firestore database.
      </p>

      {status === "idle" && (
        <button 
          onClick={handleSeed}
          className="bg-brand-cobalt hover:bg-brand-sky text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
        >
          <UploadCloud className="w-5 h-5" /> Start Migration
        </button>
      )}

      {status === "seeding" && (
        <div className="animate-pulse flex items-center gap-3 text-brand-sky font-bold">
          <div className="w-5 h-5 border-2 border-brand-sky border-t-transparent rounded-full animate-spin"></div>
          Seeding in progress. Do not close this tab...
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-3 text-emerald-400 font-bold">
          <CheckCircle className="w-5 h-5" />
          Seeding Successful!
        </div>
      )}

      {status === "error" && (
        <div className="text-red-400 font-bold bg-red-400/10 p-4 rounded-xl border border-red-500/20">
          Migration failed. Please ensure your Firestore Security Rules allow writes.
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6 bg-black/50 p-4 rounded-xl h-48 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
