"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Users,
  Clock,
  Swords,
  Check,
  X,
  MessageSquare,
  ChevronRight,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Types & Mock Data ────────────────────────────────────────────────────────
type FriendStatus = "online" | "offline" | "in_debate";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: FriendStatus;
  mutualFriends: number;
}

const MOCK_FRIENDS: UserProfile[] = [
  {
    id: "f1",
    name: "Alex Rahman",
    username: "@alexr",
    avatar: "https://i.pravatar.cc/150?u=alex",
    status: "online",
    mutualFriends: 12,
  },
  {
    id: "f2",
    name: "Sarah Chen",
    username: "@sarah.c",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    status: "in_debate",
    mutualFriends: 5,
  },
  {
    id: "f3",
    name: "James Wilson",
    username: "@jwilson",
    avatar: "https://i.pravatar.cc/150?u=james",
    status: "offline",
    mutualFriends: 3,
  },
  {
    id: "f4",
    name: "Emma Davis",
    username: "@emma_d",
    avatar: "https://i.pravatar.cc/150?u=emma",
    status: "online",
    mutualFriends: 8,
  }
];

const MOCK_REQUESTS: UserProfile[] = [
  {
    id: "r1",
    name: "Michael Chang",
    username: "@mchang22",
    avatar: "https://i.pravatar.cc/150?u=michael",
    status: "online",
    mutualFriends: 2,
  },
  {
    id: "r2",
    name: "Linda Smith",
    username: "@linda.s",
    avatar: "https://i.pravatar.cc/150?u=linda",
    status: "offline",
    mutualFriends: 0,
  }
];

// ── Friends Page Component ───────────────────────────────────────────────────
export function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "online" | "requests">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [friends, setFriends] = useState<UserProfile[]>(MOCK_FRIENDS);
  const [requests, setRequests] = useState<UserProfile[]>(MOCK_REQUESTS);

  // ── Handlers
  const handleAcceptRequest = (id: string) => {
    const user = requests.find((r) => r.id === id);
    if (user) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setFriends((prev) => [user, ...prev]);
    }
  };

  const handleDeclineRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRemoveFriend = (id: string) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      setFriends((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleInviteToDebate = (user: UserProfile) => {
    alert(`Invite sent to ${user.name} for a debate!`);
  };

  // ── Derived State
  const filteredFriends = useMemo(() => {
    let list = friends;
    if (activeTab === "online") {
      list = list.filter((f) => f.status === "online" || f.status === "in_debate");
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q)
      );
    }
    return list;
  }, [friends, activeTab, searchQuery]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-background pb-20">

      {/* ── Modern Hero Section ─────────────────────────────────────────────── */}
      <div className="px-4 pt-8 pb-4 lg:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Welcome Box */}
          <div className="md:col-span-2 relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1a0f0a] via-[#111827] to-[#1a0f15] border border-white/5 p-8 md:p-12 flex flex-col justify-center group shadow-xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

            <div className="relative z-10 w-full flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-sm backdrop-blur-sm">
                <Users className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Global Network</span>
              </div>
            </div>

            <h1 className="relative z-10 text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-sm">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 inline-block drop-shadow-sm">Inner Circle</span>
            </h1>
            <p className="relative z-10 text-base text-white/70 max-w-md font-medium leading-relaxed">
              Grow your network of critical thinkers. Challenge friends to private matches, track your mutual progress, and build your debate team.
            </p>
          </div>

          {/* Quick Action / Expand Network Box */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#111827] border border-white/5 p-8 flex flex-col justify-between group cursor-pointer hover:border-rose-500/30 transition-all hover:bg-[#1a0f15] shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <div className="flex h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10">
                <UserPlus className="h-7 w-7" />
              </div>
              <div className="flex -space-x-3 pointer-events-none">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#111827] flex items-center justify-center shadow-md relative z-0">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <h3 className="text-xl font-black text-white mb-1.5 group-hover:text-rose-300 transition-colors tracking-tight">Expand Network</h3>
              <p className="text-sm text-white/60 font-medium leading-relaxed">Discover debaters with similar interests and skill levels.</p>
            </div>

            {/* Action Arrow (implied) */}
            <div className="absolute bottom-8 right-8 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-rose-500 group-hover:border-rose-400 text-white transition-all shadow-md transform translate-x-4 group-hover:translate-x-0">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-10">

        {/* ── Search & Filter Bar ───────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">

          {/* Tabs */}
          <div className="flex bg-foreground/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="All Friends"
              count={friends.length}
            />
            <TabButton
              active={activeTab === "online"}
              onClick={() => setActiveTab("online")}
              label="Online"
              indicator
            />
            <TabButton
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
              label="Requests"
              count={requests.length > 0 ? requests.length : undefined}
              alert={requests.length > 0}
            />
          </div>

          {/* Search */}
          {activeTab !== "requests" && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-card border-border/50 focus-visible:ring-sky-500/50 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Content Area ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {activeTab === "requests" ? (
            /* Requests View */
            requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <RequestCard
                    key={req.id}
                    user={req}
                    onAccept={() => handleAcceptRequest(req.id)}
                    onDecline={() => handleDeclineRequest(req.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="No pending requests"
                subtitle="You're all caught up! Check back later for new friend requests."
              />
            )
          ) : (
            /* Friends View (All or Online) */
            filteredFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    user={friend}
                    onRemove={() => handleRemoveFriend(friend.id)}
                    onInvite={() => handleInviteToDebate(friend)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title={activeTab === "online" ? "No friends online" : "No friends found"}
                subtitle={
                  activeTab === "online"
                    ? "None of your friends are currently online."
                    : searchQuery
                      ? "Try adjusting your search terms."
                      : "Add some friends to start debating!"
                }
              />
            )
          )}
        </div>

      </div>
    </div >
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  label,
  count,
  indicator,
  alert
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  indicator?: boolean;
  alert?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
      )}
    >
      {indicator && (
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      )}
      {label}
      {count !== undefined && (
        <span className={cn(
          "ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
          (alert || active) ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

function FriendCard({ user, onRemove, onInvite }: { user: UserProfile; onRemove: () => void; onInvite: () => void; }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-border/80 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-background" />
          <StatusIndicator status={user.status} />
        </div>
        <div className="flex flex-col truncate">
          <span className="truncate font-bold text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.username} · {user.mutualFriends} mutual friends</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onInvite}
          className="flex items-center justify-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-500/20 dark:text-sky-400"
        >
          <Swords className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Debate</span>
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RequestCard({ user, onAccept, onDecline }: { user: UserProfile; onAccept: () => void; onDecline: () => void; }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatar} alt={user.name} className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />
        <div className="flex flex-col truncate">
          <span className="truncate font-bold text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.username} · {user.mutualFriends} mutuals</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onDecline}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
          aria-label="Decline"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={onAccept}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600 shadow-sm shadow-sky-500/20"
          aria-label="Accept"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: FriendStatus }) {
  return (
    <div
      className={cn(
        "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background",
        status === "online" && "bg-emerald-500",
        status === "offline" && "bg-slate-300 dark:bg-slate-600",
        status === "in_debate" && "bg-rose-500 flex items-center justify-center"
      )}
      title={status.replace("_", " ")}
    >
      {status === "in_debate" && <Swords className="h-2 w-2 text-white" />}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground/50">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{subtitle}</p>
    </div>
  );
}
