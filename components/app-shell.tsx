"use client";

import { useState, type ReactNode } from "react";
import {
  Compass,
  BookOpen,
  User,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FriendsPage } from "@/components/pages/friends-page";
import { DebateRoomPage } from "@/components/debate/debate-room-page";
import type { YoutubeChallenge } from "@/lib/models/youtube-challenge";
import type { UserProfile } from "@/lib/models/user-profile";

interface AppShellProps {
  browseContent: ReactNode;
  learningHubContent: ReactNode;
  profileContent: ReactNode;
  userProfile: UserProfile;
  debateChallenge?: YoutubeChallenge | null;
  onExitDebateRoom?: () => void;
  userRole?: "pro" | "con" | null;
}

type Tab = "browse" | "learning" | "profile";

const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: "browse", label: "Browse", icon: Compass },
  { id: "learning", label: "Learning Hub", icon: BookOpen },
  { id: "profile", label: "Profile", icon: User },
];

export function AppShell({
  browseContent,
  learningHubContent,
  profileContent,
  userProfile,
  debateChallenge,
  onExitDebateRoom,
  userRole,
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [showFriends, setShowFriends] = useState(false);
  const CURRENT_USER = "DebateMe_User";

  // Full-screen debate room — bypasses header/nav entirely
  if (debateChallenge) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07070e]">
        <DebateRoomPage
          challenge={debateChallenge}
          currentUser={CURRENT_USER}
          onExit={() => onExitDebateRoom?.()}
          userRole={userRole ?? undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-card px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            DebateMe
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {tabs.map((tab) => {
            let activeColor = "text-primary bg-primary/10"; // Default
            if (tab.id === "browse") activeColor = "text-violet-500 bg-violet-500/10";
            if (tab.id === "learning") activeColor = "text-emerald-500 bg-emerald-500/10";
            if (tab.id === "profile") activeColor = "text-cyan-500 bg-cyan-500/10";

            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowFriends(false); }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  !showFriends && activeTab === tab.id
                    ? activeColor
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
          {/* Friends button - desktop */}
          <button
            onClick={() => setShowFriends(true)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              showFriends
                ? "bg-rose-500/10 text-rose-500"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label="Add friends"
          >
            <UserPlus className="h-4 w-4" />
            Friends
          </button>
        </nav>

        {/* Friends button - always visible on right side (mobile) */}
        <div className="ml-auto flex items-center md:hidden">
          <button
            onClick={() => setShowFriends(true)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              showFriends ? "bg-rose-500/10 text-rose-500" : "text-muted-foreground hover:bg-secondary"
            )}
            aria-label="Add friends"
          >
            <UserPlus className={cn("h-5 w-5", showFriends ? "text-rose-500" : "text-muted-foreground")} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className={!showFriends && activeTab === "browse" ? "block" : "hidden"}>
          {browseContent}
        </div>
        <div className={!showFriends && activeTab === "learning" ? "block" : "hidden"}>
          {learningHubContent}
        </div>
        <div className={!showFriends && activeTab === "profile" ? "block" : "hidden"}>
          {profileContent}
        </div>
        <div className={showFriends ? "block" : "hidden"}>
          <FriendsPage />
        </div>
      </main>

      {/* Bottom Navigation (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = !showFriends && activeTab === tab.id;
          let activeColorMobile = "text-primary"; // Default
          if (tab.id === "browse") activeColorMobile = "text-violet-500";
          if (tab.id === "learning") activeColorMobile = "text-emerald-500";
          if (tab.id === "profile") activeColorMobile = "text-cyan-500";

          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowFriends(false); }}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                isActive
                  ? activeColorMobile
                  : "text-muted-foreground"
              )}
              aria-label={tab.label}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
