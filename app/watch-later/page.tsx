"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, BookmarkX, BookmarkMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export default function WatchLaterPage() {
  const { user, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchWatchLater() {
      if (!user) {
        setVideos([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "users", user.uid, "watchLater"));
        const snapshot = await getDocs(q);
        const watchLaterIds = snapshot.docs.map(doc => doc.data().videoId as string);

        if (watchLaterIds.length === 0) {
           setVideos([]);
           setLoading(false);
           return;
        }

        const videoPromises = watchLaterIds.map(async id => {
           const vDoc = await getDoc(doc(db, "videos", id));
           if (vDoc.exists()) {
              return { id: vDoc.id, ...vDoc.data() } as Video;
           }
           return null;
        });

        const vids = (await Promise.all(videoPromises)).filter(Boolean) as Video[];
        setVideos(vids);
      } catch (err) {
        console.error("Failed to load watch later videos", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchWatchLater();
    }
  }, [user, authLoading]);

  const removeFromWatchLater = async (videoId: string) => {
    if (!user) return;
    
    setRemovingIds(prev => new Set(prev).add(videoId));
    try {
      const docRef = doc(db, "users", user.uid, "watchLater", videoId);
      await deleteDoc(docRef);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err) {
      console.error("Error removing from watch later", err);
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center flex-col items-center py-32 text-indigo-500 min-h-[calc(100vh-80px)]">
         <Loader2 className="w-10 h-10 animate-spin mb-4" />
      </div>
    );
  }

  if (!user) {
     return (
       <div className="max-w-2xl mx-auto text-center py-32 px-6 min-h-[calc(100vh-80px)]">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex flex-col items-center justify-center mx-auto mb-6 text-zinc-600">
             <BookmarkX className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">You're not logged in</h1>
          <p className="text-zinc-400 mb-8 text-lg">Sign in to save videos to your Watch Later list and access them anytime.</p>
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">
               Log in to continue
            </Button>
          </Link>
       </div>
     );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 w-full min-h-[calc(100vh-80px)]">
      <div className="mb-10 border-b border-zinc-800 pb-6">
         <h1 className="text-3xl font-bold text-white mb-2">Watch Later</h1>
         <p className="text-zinc-400">Videos you've saved to watch for later.</p>
      </div>

      {loading ? (
        <div className="flex justify-center flex-col items-center py-20 text-indigo-500">
           <Loader2 className="w-10 h-10 animate-spin mb-4" />
           <span className="text-zinc-400">Loading your list...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
          <h2 className="text-xl font-bold text-white mb-2">Your list is empty</h2>
          <p className="text-zinc-500 mb-6">You haven't saved any videos yet.</p>
          <Link href="/videos">
             <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                 Explore Videos
             </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => {
             const isRemoving = removingIds.has(video.id);
             
             return (
               <Card key={video.id} className="bg-zinc-900 border-zinc-800 flex flex-col h-full">
                  <div className="aspect-video bg-zinc-950 w-full rounded-t-xl overflow-hidden relative group">
                     {/* Placeholder */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-zinc-800 group-hover:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     </div>
                  </div>
                  <CardHeader className="flex-1 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-lg text-zinc-100 line-clamp-2 leading-tight mb-2">{video.title}</CardTitle>
                        <CardDescription className="text-zinc-400 mt-2 line-clamp-2">{video.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                       variant="outline" 
                       onClick={() => removeFromWatchLater(video.id)}
                       disabled={isRemoving}
                       className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 cursor-pointer"
                    >
                       {isRemoving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookmarkMinus className="w-4 h-4 mr-2" />}
                       Remove from list
                    </Button>
                  </CardContent>
               </Card>
             );
          })}
        </div>
      )}
    </main>
  );
}
