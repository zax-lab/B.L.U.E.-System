"use client";

import { useState } from "react";
import BlueprintView, { Blueprint } from "@/components/BlueprintView";
import { Loader2, PlaySquare } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError("");
    setBlueprint(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: goal }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate blueprint");
      }

      setBlueprint(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-[calc(100vh-80px)] p-6 font-sans flex flex-col pt-10">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow lg:grid-rows-3 pb-6">
        
        {/* Main Input Card - spans 2 cols, 2 rows */}
        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-zinc-900 rounded-[32px] border border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <svg className="w-48 h-48 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="relative z-10 w-full mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Learn to do<br/>Absolutely Anything.</h2>
            <p className="text-zinc-400 text-lg max-w-sm">Enter a skill or goal, and the B.L.U.E. System will break it down into an actionable blueprint.</p>
          </div>
          
          <div className="relative z-10 w-full mt-auto">
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="e.g., Code a React app"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full sm:flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
              <button 
                type="submit" 
                disabled={loading || !goal.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Create Blueprint"
                )}
              </button>
            </form>
            {error && <p className="text-red-400 mt-4 text-sm font-medium">{error}</p>}
          </div>
        </div>

        {/* Example small item 1: Video Library */}
        <Link href="/videos" className="col-span-1 row-span-1 bg-indigo-500/10 rounded-[32px] border border-indigo-500/20 p-6 flex flex-col justify-between group hover:bg-indigo-500/20 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <PlaySquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Video Library</h3>
            <p className="text-zinc-500 text-sm">Discover and watch later</p>
          </div>
        </Link>

        {/* Output / Blueprint Container - spans remaining space */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-2 xl:row-span-3 row-span-2 bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 sm:p-8 flex flex-col min-h-[400px]">
          {blueprint ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <BlueprintView blueprint={blueprint} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 relative pointer-events-none">
              <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
                <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-300 mb-2">Awaiting Goal</h3>
              <p className="text-zinc-500 max-w-xs">Your structured blueprint will gracefully appear here once generated.</p>
            </div>
          )}
        </div>

        {/* Example small item 2 */}
        <div className="col-span-1 row-span-1 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20 p-6 flex flex-col justify-between hidden lg:flex">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Action Tracking</h3>
            <p className="text-zinc-500 text-sm">Monitor your progress</p>
          </div>
        </div>

        {/* Example small item 3 */}
        <div className="col-span-1 row-span-1 bg-orange-500/10 rounded-[32px] border border-orange-500/20 p-6 flex flex-col justify-between hidden xl:flex">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Visualize</h3>
            <p className="text-zinc-500 text-sm">See the bigger picture</p>
          </div>
        </div>

      </div>
    </div>
  );
}
