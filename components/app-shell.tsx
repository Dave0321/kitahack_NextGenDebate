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
import type { UserProfile } from "@/lib/models/user-profile";

interface AppShellProps {
  browseContent: ReactNode;
  learningHubContent: ReactNode;
  profileContent: ReactNode;
  userProfile: UserProfile;
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
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [showFriends, setShowFriends] = useState(false);

  // If friends page is open, render it
  if (showFriends) {
    return <FriendsPage onBack={() => setShowFriends(false)} />;
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
          {/* Friends button - desktop */}
          <button
            onClick={() => setShowFriends(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            aria-label="Add friends"
          >
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className={activeTab === "browse" ? "block" : "hidden"}>
          {browseContent}
        </div>
        <div className={activeTab === "learning" ? "block" : "hidden"}>
          {learningHubContent}
        </div>
        <div className={activeTab === "profile" ? "block" : "hidden"}>
          {profileContent}
        </div>
      </main>

      {/* Bottom Navigation (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
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
