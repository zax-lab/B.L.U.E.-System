"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { seedVideosIfEmpty } from "@/lib/seedVideos";
import { Loader2, Search, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [watchLaterList, setWatchLaterList] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchVideos() {
      try {
        if (user) {
          await seedVideosIfEmpty(user.uid);
        }
        
        const q = query(collection(db, "videos"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
        setVideos(data);
        setFilteredVideos(data);
      } catch (err) {
        console.error("Failed to load videos", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadWatchLater() {
      if (!user) {
        setWatchLaterList(new Set());
        return;
      }
      try {
        const q = query(collection(db, "users", user.uid, "watchLater"));
        const snapshot = await getDocs(q);
        const savedIds = new Set(snapshot.docs.map(doc => doc.data().videoId as string));
        setWatchLaterList(savedIds);
      } catch (err) {
        console.error("Failed to load watch later list", err);
      }
    }

    fetchVideos();
    loadWatchLater();
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const filtered = videos.filter(v => 
      v.title.toLowerCase().includes(queryLower) ||
      v.description.toLowerCase().includes(queryLower) ||
      v.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
    setFilteredVideos(filtered);
  }, [searchQuery, videos]);

  const toggleWatchLater = async (videoId: string) => {
    if (!user) return alert("Please log in to save videos.");
    
    setToggling(prev => new Set(prev).add(videoId));
    const isSaved = watchLaterList.has(videoId);
    const docRef = doc(db, "users", user.uid, "watchLater", videoId);

    try {
      if (isSaved) {
        await deleteDoc(docRef);
        setWatchLaterList(prev => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });
      } else {
        await setDoc(docRef, {
          videoId,
          addedAt: new Date()
        });
        setWatchLaterList(prev => new Set(prev).add(videoId));
      }
    } catch (err) {
      console.error("Error toggling watch later", err);
    } finally {
      setToggling(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 w-full min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
         <div>
            <h1 className="text-3xl font-bold text-white mb-2">Video Library</h1>
            <p className="text-zinc-400">Search and discover interesting videos</p>
         </div>
         
         <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
           <Input 
             type="text" 
             placeholder="Search by title, description or tag..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10 bg-zinc-900 border-zinc-800 text-white rounded-xl focus:ring-indigo-500"
           />
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center flex-col items-center py-20 text-indigo-500">
           <Loader2 className="w-10 h-10 animate-spin mb-4" />
           <span className="text-zinc-400">Loading library...</span>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
             <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
          <p className="text-zinc-500">Try adjusting your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => {
             const isSaved = watchLaterList.has(video.id);
             const isToggling = toggling.has(video.id);
             
             return (
               <Card key={video.id} className="bg-zinc-900 border-zinc-800 flex flex-col h-full hover:border-zinc-700 transition-colors">
                  <div className="aspect-video bg-zinc-950 w-full rounded-t-xl overflow-hidden relative group">
                     {/* Placeholder */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-zinc-800 group-hover:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     </div>
                  </div>
                  <CardHeader className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-lg text-zinc-100 line-clamp-2 leading-tight">{video.title}</CardTitle>
                        <CardDescription className="text-zinc-400 mt-2 line-clamp-2">{video.description}</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleWatchLater(video.id)}
                        disabled={isToggling}
                        className={`shrink-0 rounded-full hover:bg-zinc-800 cursor-pointer ${isSaved ? 'text-indigo-400' : 'text-zinc-500 hover:text-white'}`}
                        title={isSaved ? "Remove from Watch Later" : "Add to Watch Later"}
                      >
                         {isToggling ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                       {video.tags.map(tag => (
                         <span key={tag} className="text-xs font-medium px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-full">
                           {tag}
                         </span>
                       ))}
                    </div>
                  </CardContent>
               </Card>
             );
          })}
        </div>
      )}
    </main>
  );
}
