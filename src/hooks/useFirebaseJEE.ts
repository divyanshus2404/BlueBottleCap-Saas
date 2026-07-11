import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { JEEQuestion } from "../data/jeePyqs";
import { RepeatedTest } from "../data/repeatedJeePyqs";

export interface CloudSubject {
  id: string;
  name: string;
  chapters: CloudChapter[];
}

export interface CloudChapter {
  id: string;
  name: string;
  questions?: JEEQuestion[]; // fetched lazily
}

export function useFirebaseJEE() {
  const [mockTests, setMockTests] = useState<RepeatedTest[]>([]);
  const [subjects, setSubjects] = useState<CloudSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        if (!db) throw new Error("Database not initialized");
        // Load mock tests
        const mockSnapshot = await getDocs(collection(db, "jee_mock_tests"));
        const fetchedMockTests: RepeatedTest[] = mockSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RepeatedTest[];
        setMockTests(fetchedMockTests);

        // Load subjects and their chapters (shallow)
        const subjectsSnapshot = await getDocs(collection(db, "jee_subjects"));
        const fetchedSubjects: CloudSubject[] = [];
        
        for (const subDoc of subjectsSnapshot.docs) {
          const subData = subDoc.data();
          const chaptersSnapshot = await getDocs(collection(db, `jee_subjects/${subDoc.id}/chapters`));
          
          const chapters = chaptersSnapshot.docs.map(cDoc => ({
            id: cDoc.id,
            name: cDoc.data().name
          }));

          fetchedSubjects.push({
            id: subDoc.id,
            name: subData.name,
            chapters
          });
        }
        
        // Sort subjects typically (Physics, Chemistry, Maths)
        fetchedSubjects.sort((a, b) => b.name.localeCompare(a.name)); 
        setSubjects(fetchedSubjects);

      } catch (err) {
        console.error("Error loading Firebase JEE Data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const loadChapterQuestions = async (subjectId: string, chapterId: string): Promise<JEEQuestion[]> => {
    try {
      if (!db) throw new Error("Database not initialized");
      const qSnapshot = await getDocs(collection(db, `jee_subjects/${subjectId}/chapters/${chapterId}/questions`));
      return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JEEQuestion[];
    } catch (err) {
      console.error("Error fetching chapter questions:", err);
      return [];
    }
  };

  return { mockTests, subjects, loading, loadChapterQuestions };
}
