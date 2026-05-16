"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="flex items-center justify-between py-4 px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:inline-block">B.L.U.E. System</span>
        </Link>
        <Link href="/videos" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Video Library
        </Link>
        <Link href="/watch-later" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Watch Later
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400 hidden sm:inline-block">
                  {user.email}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer">
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
