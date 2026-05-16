import { collection, doc, writeBatch, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SAMPLE_VIDEOS = [
  {
    id: "video-1",
    title: "How to Code a React App from Scratch",
    description: "Learn the basics of React by building a complete application step-by-step.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // dummy
    tags: ["react", "programming", "javascript", "tutorial"],
  },
  {
    id: "video-2",
    title: "Mastering Tailwind CSS in 20 Minutes",
    description: "A fast-paced guide to modern styling using Tailwind CSS.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["tailwind", "css", "styling", "frontend"],
  },
  {
    id: "video-3",
    title: "The B.L.U.E. System Explained",
    description: "Discover how to break down any goal into actionable steps.",
    url: "https://www.youtube.com/watch?v=qcRKmm3B25c",
    tags: ["productivity", "system", "learning", "goals"],
  },
  {
    id: "video-4",
    title: "Next.js App Router Crash Course",
    description: "Everything you need to know about the new Next.js App Router.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["nextjs", "react", "crash-course"],
  },
  {
    id: "video-5",
    title: "Firebase vs Supabase: Which is better?",
    description: "An in-depth comparison of two popular backend-as-a-service platforms.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["firebase", "supabase", "backend", "comparison"],
  }
];

export async function seedVideosIfEmpty(userId: string) {
  try {
    const q = query(collection(db, "videos"), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      const batch = writeBatch(db);
      for (const video of SAMPLE_VIDEOS) {
        const docRef = doc(db, "videos", video.id);
        batch.set(docRef, {
          title: video.title,
          description: video.description,
          url: video.url,
          tags: video.tags,
          creatorId: userId,
          createdAt: new Date(),
        });
      }
      await batch.commit();
      console.log("Mock videos seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding videos:", error);
  }
}
