"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/lib/models/user-profile";
import {
  getDebateHistory,
  getWinCount,
  getLossCount,
  getDrawCount,
  getTotalDebates,
  type DebateHistory,
} from "@/lib/models/debate-history";
import { getSDGsByIds, SDG_GOALS } from "@/lib/data/sdg-data";
import {
  Settings,
  Edit3,
  Check,
  X,
  User,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  ArrowLeft,
  Trophy,
  Swords,
  Clock,
  Minus,
  TrendingUp,
  Target,
  BarChart3,
  Flame,
  Star,
  Award,
  Plus,
  Globe as GlobeIcon,
  Lock as LockIcon,
  Calendar,
  Zap,
  Radio,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  YoutubeChallenge,
  loadChallenges,
  saveChallenges,
  seedChallenges,
} from "@/lib/models/youtube-challenge";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

type View = "profile" | "settings" | "expanded-challenges" | "expanded-history";

interface ProfilePageProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export function ProfilePage({ userProfile, onLogout }: ProfilePageProps) {
  const [view, setView] = useState<View>("profile");
  const [username, setUsername] = useState(userProfile.getDisplayName());
  const [bio, setBio] = useState(
    userProfile.bio ||
    "Passionate about critical thinking and sustainable development. Making an impact, one debate at a time."
  );
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(username);
  const [editBio, setEditBio] = useState(bio);

  // New state for Modals
  const [showSdgPicker, setShowSdgPicker] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DebateHistory | null>(null);
  const [interestedSdgs, setInterestedSdgs] = useState<number[]>(userProfile.interestedSdgs);
  const [challengeDetailItem, setChallengeDetailItem] = useState<YoutubeChallenge | null>(null);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Hard-coded demo challenges always shown on the profile
  const HARDCODED_CHALLENGES: YoutubeChallenge[] = [
    new YoutubeChallenge({
      id: "hc-1",
      raisedBy: userProfile.nickname || "DebateEnthusiast",
      videoUrl: "https://www.youtube.com/watch?v=hJP5GqnTrNo",
      topic: "Should Generative AI Be Open-Sourced?",
      description: "OpenAI, Google, and Meta all have different stances on open-sourcing models. I argue open-source accelerates innovation — but at what risk? Join me to contest this.",
      status: "open",
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      visibility: "public",
      sdgTags: [9, 16],
      raisedByRole: "pro",
      category: "trending",
    }),
    new YoutubeChallenge({
      id: "hc-2",
      raisedBy: userProfile.nickname || "DebateEnthusiast",
      videoUrl: "https://www.youtube.com/watch?v=EhAemz1v7dQ",
      topic: "Carbon Taxes vs. Green Subsidies: Which is More Effective?",
      description: "Private research session — testing arguments before the open challenge goes live. Invite-only for trusted sparring partners.",
      status: "scheduled",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      scheduledAt: new Date(Date.now() + 2 * 3600000).toISOString(),
      acceptedBy: "EcoPolicy_Hawk",
      visibility: "private",
      sdgTags: [13, 7],
      raisedByRole: "con",
      category: "recommended",
    }),
    new YoutubeChallenge({
      id: "hc-3",
      raisedBy: userProfile.nickname || "DebateEnthusiast",
      videoUrl: "https://www.youtube.com/watch?v=hJP5GqnTrNo",
      topic: "Is Universal Basic Income Sustainable for Developing Nations?",
      description: "Pilot programs in Kenya and Finland produced mixed results. I'll argue UBI is a necessary safety net — challengers take the 'con' side.",
      status: "matched",
      createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      acceptedBy: "EconRealist",
      visibility: "public",
      sdgTags: [1, 10],
      raisedByRole: "pro",
      category: "recommended",
    }),
    new YoutubeChallenge({
      id: "hc-4",
      raisedBy: userProfile.nickname || "DebateEnthusiast",
      videoUrl: "https://www.youtube.com/watch?v=EhAemz1v7dQ",
      topic: "Should Social Media Platforms Be Liable for Misinformation?",
      description: "Internal policy brief draft — not ready for public debate. Refining arguments on platform accountability before publishing.",
      status: "open",
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      visibility: "private",
      sdgTags: [16, 10],
      raisedByRole: "pro",
      category: "recommended",
    }),
  ];

  const [activeChallenges, setActiveChallenges] = useState<YoutubeChallenge[]>(() => {
    let all = loadChallenges();
    // For demo/prototype: if all is empty (e.g. user deleted everything), use seed data for initial view
    if (all.length === 0) all = seedChallenges;

    const dynamic = all
      .filter((ch: any) => ch.raisedBy === userProfile.nickname || ch.raisedBy === "DebateEnthusiast")
      .map((d: any) => new YoutubeChallenge(d));

    // Merge hardcoded first, then dynamic (avoid duplicates by id)
    const dynamicIds = new Set(dynamic.map((c: YoutubeChallenge) => c.id));
    return [
      ...HARDCODED_CHALLENGES,
      ...dynamic.filter((c: YoutubeChallenge) => !HARDCODED_CHALLENGES.some(hc => hc.id === c.id)),
    ];
  });

  useEffect(() => {
    const syncChallenges = () => {
      let all = loadChallenges();
      if (all.length === 0) all = seedChallenges;

      const dynamic = all
        .filter((ch: any) => ch.raisedBy === userProfile.nickname || ch.raisedBy === "DebateEnthusiast")
        .map((d: any) => new YoutubeChallenge(d));

      setActiveChallenges([
        ...HARDCODED_CHALLENGES,
        ...dynamic.filter((c: YoutubeChallenge) => !HARDCODED_CHALLENGES.some(hc => hc.id === c.id)),
      ]);
    };

    window.addEventListener("debate_me_challenges_updated", syncChallenges);
    window.addEventListener("storage", syncChallenges);

    // Crucial: call sync on mount and when userProfile changes
    syncChallenges();

    return () => {
      window.removeEventListener("debate_me_challenges_updated", syncChallenges);
      window.removeEventListener("storage", syncChallenges);
    };
  }, [userProfile.nickname]);

  const handleDeleteChallenge = (id: string) => {
    if (window.confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
      const next = activeChallenges.filter(ch => ch.id !== id);
      setActiveChallenges(next);
      // Sync with global store
      const allStored = loadChallenges().filter((ch: any) => ch.id !== id);
      saveChallenges(allStored);
    }
  };

  const debateHistory = useMemo(() => getDebateHistory(), []);
  const totalDebates = getTotalDebates();
  const wins = getWinCount();
  const losses = getLossCount();
  const draws = getDrawCount();

  const handleSave = () => {
    setUsername(editUsername.trim() || username);
    setBio(editBio.trim() || bio);
    setEditing(false);
    userProfile.updateProfile({ nickname: editUsername, bio: editBio });
  };

  const handleCancel = () => {
    setEditUsername(username);
    setEditBio(bio);
    setEditing(false);
  };

  if (view === "settings") {
    return <SettingsView onBack={() => setView("profile")} onLogout={onLogout} />;
  }

  if (view === "expanded-challenges") {
    return (
      <div className="flex flex-col py-6 bg-background min-h-screen">
        <div className="flex items-center gap-4 px-4 pb-8 lg:px-8">
          <button onClick={() => setView("profile")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-all active:scale-95">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase tracking-[0.1em]">All Raised Challenges</h1>
        </div>
        <div className="px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeChallenges.map((challenge: any) => (
            <RaisedChallengeCard key={challenge.id} challenge={challenge} onDelete={() => handleDeleteChallenge(challenge.id)} onDetails={() => setChallengeDetailItem(challenge)} />
          ))}
        </div>
        <RaisedChallengeDetailModal challenge={challengeDetailItem} onClose={() => setChallengeDetailItem(null)} />
      </div>
    );
  }

  if (view === "expanded-history") {
    return (
      <div className="flex flex-col py-6 bg-background min-h-screen">
        <div className="flex items-center gap-4 px-4 pb-8 lg:px-8">
          <button onClick={() => setView("profile")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-all active:scale-95">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase tracking-[0.1em]">Debate Chronicles</h1>
        </div>
        <div className="px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debateHistory.map((record) => (
            <AestheticHistoryCard key={record.id} record={record} onClick={() => setSelectedRecord(record)} />
          ))}
        </div>
        <DebateSummaryModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20 bg-background/50">
      {/* Immersive Header Backdrop */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 lg:h-64">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-[pulse_8s_infinite]" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Profile Info Overlay Card */}
      <div className="relative -mt-24 px-4 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl p-6 shadow-2xl shadow-indigo-500/10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-[3px] shadow-xl shadow-cyan-900/30">
                <div className="flex h-full w-full items-center justify-center rounded-[calc(1.5rem-3px)] bg-card">
                  <User className="h-16 w-16 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg border-2 border-card">
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-3">
              {editing ? (
                <div className="flex flex-col gap-3 max-w-md">
                  <Input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-background/40 border-white/10 font-bold text-lg"
                    placeholder="Username"
                  />
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="bg-background/40 border-white/10 text-sm"
                    placeholder="Short bio"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary/90">
                      <Check className="h-4 w-4 mr-1.5" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground">
                      <X className="h-4 w-4 mr-1.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">{username}</h2>
                    <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[11px] py-0.5 px-2.5 uppercase tracking-widest font-bold">
                      Elite Debater
                    </Badge>
                  </div>
                  <p className="max-w-xl text-base leading-relaxed text-muted-foreground font-medium">
                    {bio}
                  </p>

                  {/* Interest Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <p className="w-full text-[10px] font-black uppercase text-secondary-foreground/30 tracking-[0.2em] mb-1">Passionate About</p>
                    {getSDGsByIds(interestedSdgs).map((sdg) => (
                      <div
                        key={sdg.id}
                        className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-default group"
                        title={sdg.name}
                      >
                        <div className="h-2 w-2 rounded-full group-hover:animate-pulse" style={{ backgroundColor: sdg.color }} />
                        <span className="text-[10px] font-bold text-foreground/80">{sdg.shortName}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowSdgPicker(true)}
                      className="flex items-center justify-center h-7 w-7 rounded-full border border-dashed border-white/20 text-muted-foreground/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 shrink-0 md:items-end w-full md:w-auto">
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-foreground/80 hover:bg-white/10 transition-all"
                  onClick={() => {
                    setEditUsername(username);
                    setEditBio(bio);
                    setEditing(true);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-2" />
                  Edit Profile
                </Button>
              )}
              <button
                onClick={() => setView("settings")}
                className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-foreground/80 transition-colors px-2 py-1"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-secondary/5 pt-6">
            <StatItem icon={Swords} label="Battles" value={totalDebates} color="text-indigo-600" />
            <StatItem icon={Trophy} label="Wins" value={wins} color="text-emerald-600" />
            <StatItem icon={Flame} label="Hot Streak" value={3} color="text-orange-600" />
            <StatItem icon={Award} label="Win Rate" value={`${Math.round((wins / totalDebates) * 100)}%`} color="text-violet-600" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-8">
        {/* Main Content: Sections (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Raised Challenges Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 tracking-tight uppercase">
                <Swords className="h-5 w-5 text-violet-500" /> My Raised Challenges
              </h3>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-violet-500/5 border-violet-500/10 text-violet-500 font-bold">
                  {activeChallenges.length} ACTIVE
                </Badge>
                <button
                  onClick={() => setView("expanded-challenges")}
                  className="text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.length > 0 ? (
                activeChallenges.slice(0, 2).map((challenge: any) => (
                  <RaisedChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onDelete={() => handleDeleteChallenge(challenge.id)}
                    onDetails={() => setChallengeDetailItem(challenge)}
                  />
                ))
              ) : (
                <div className="md:col-span-2 rounded-3xl border border-dashed border-white/10 bg-card/40 p-8 text-center">
                  <p className="text-sm text-muted-foreground">You haven't raised any challenges yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 tracking-tight">
                <Clock className="h-5 w-5 text-primary" /> DEBATE CHRONICLES
              </h3>
              <button
                onClick={() => setView("expanded-history")}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {debateHistory.slice(0, 3).map((record) => (
                <AestheticHistoryCard
                  key={record.id}
                  record={record}
                  onClick={() => setSelectedRecord(record)}
                />
              ))}
              {debateHistory.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mx-auto mb-4">
                    <Swords className="h-8 w-8 text-white/20" />
                  </div>
                  <p className="text-muted-foreground/70 font-medium">Your arena awaits. Start your first debate!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Analytics (1/3) */}
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-6 tracking-tight">
              <BarChart3 className="h-5 w-5 text-indigo-500" /> ANALYTICS CENTER
            </h3>
            <ProfileAnalytics history={debateHistory} wins={wins} losses={losses} draws={draws} />
          </section>

          {/* Quick Actions / Shortcuts */}
          <section className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl p-6">
            <h4 className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Global Impact</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <Target className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground/90">Main SDG Focus</p>
                    <p className="text-[10px] text-muted-foreground/70">Climate Action (SDG 13)</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      <SdgPickerModal
        isOpen={showSdgPicker}
        onClose={() => setShowSdgPicker(false)}
        selectedIds={interestedSdgs}
        onSelect={(id) => {
          const newSdgs = interestedSdgs.includes(id)
            ? interestedSdgs.filter(s => s !== id)
            : [...interestedSdgs, id];
          setInterestedSdgs(newSdgs);
          userProfile.updateProfile({ interestedSdgs: newSdgs });
        }}
      />

      <DebateSummaryModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
      <RaisedChallengeDetailModal
        challenge={challengeDetailItem}
        onClose={() => setChallengeDetailItem(null)}
      />
    </div>
  );
}

// --- Subcomponents ---

import type { LucideIcon } from "lucide-react";

function StatItem({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: string | number, color: string }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1 group">
      <div className="flex items-center gap-2 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className={cn("text-3xl font-black tracking-tight transition-all group-hover:scale-105", color)}>{value}</span>
    </div>
  );
}

function AestheticHistoryCard({ record, onClick }: { record: DebateHistory, onClick?: () => void }) {
  const sdgs = getSDGsByIds(record.sdgTags);
  const resultColors = {
    win: {
      bg: "from-emerald-900/10 to-transparent border-emerald-500/20",
      text: "text-emerald-600",
      badge: "bg-emerald-500/20 text-emerald-700",
      accent: "#10b981"
    },
    loss: {
      bg: "from-rose-900/10 to-transparent border-rose-500/20",
      text: "text-rose-600",
      badge: "bg-rose-500/20 text-rose-700",
      accent: "#f43f5e"
    },
    draw: {
      bg: "from-amber-900/10 to-transparent border-amber-500/20",
      text: "text-amber-600",
      badge: "bg-amber-500/20 text-amber-700",
      accent: "#f59e0b"
    },
  };

  const style = resultColors[record.result];
  const mainSdg = sdgs[0];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group overflow-hidden rounded-3xl border bg-card/40 transition-all duration-300 hover:scale-[1.01] hover:bg-card/60 hover:shadow-xl hover:shadow-black/20 cursor-pointer",
        style.bg
      )}
    >
      {/* Decorative background SDG icon */}
      {mainSdg && (
        <div
          className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
          style={{ color: mainSdg.color }}
        >
          <div className="h-32 w-32 rounded-3xl border-[20px] border-current" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
        {/* Outcome Badge */}
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:rotate-12",
          style.badge
        )}>
          {record.result === "win" ? <Trophy className="h-6 w-6" /> : record.result === "loss" ? <Swords className="h-6 w-6" /> : <Minus className="h-6 w-6" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {sdgs.map(s => (
              <span key={s.id} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-foreground/50" style={{ borderColor: `${s.color}20`, color: s.color }}>
                {s.shortName}
              </span>
            ))}
          </div>
          <h4 className="text-lg font-bold text-foreground tracking-tight leading-tight transition-colors group-hover:text-primary">
            {record.topicTitle}
          </h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-2 w-2 text-muted-foreground/70" />
              </div>
              <span className="text-xs text-muted-foreground/70 font-medium">Opponent: <span className="text-muted-foreground font-bold">{record.opponentName}</span></span>
            </div>
            <p className="text-xs font-black text-muted-foreground/70 tabular-nums">
              Score: <span className={style.text}>{record.getScoreDisplay()}</span>
            </p>
          </div>
        </div>

        {/* Action/Time */}
        <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
          <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border", style.badge, "border-current/20")}>
            {record.getResultLabel()}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <Clock className="h-3 w-3" />
            {record.getDurationLabel()} · {record.getFormattedDate()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileAnalytics({ history, wins, losses, draws }: { history: DebateHistory[], wins: number, losses: number, draws: number }) {
  // Performance Data
  const performanceData = [
    { name: "Wins", value: wins, color: "#10b981" },
    { name: "Losses", value: losses, color: "#f43f5e" },
    { name: "Draws", value: draws, color: "#f59e0b" },
  ];

  // SDG Breakdown Data
  const sdgCounts: Record<number, number> = {};
  history.forEach(h => {
    h.sdgTags.forEach(id => {
      sdgCounts[id] = (sdgCounts[id] || 0) + 1;
    });
  });

  const sdgData = Object.entries(sdgCounts).map(([id, count]) => {
    const sdg = SDG_GOALS.find(s => s.id === Number(id));
    return {
      name: sdg?.shortName || "Unknown",
      value: count,
      color: sdg?.color || "#6366f1",
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Performance Pie */}
      <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 shadow-xl">
        <h4 className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Win/Loss Ratio</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ backgroundColor: "#0a0a18", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sustainable Topics Distribution */}
      <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 shadow-xl">
        <h4 className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Topic Distribution</h4>
        <div className="space-y-4">
          {sdgData.map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-widest">{item.name}</span>
                <span className="text-foreground/90">{Math.round((item.value / history.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(item.value / history.length) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Settings View (Keeping existing logic but slightly updating UI) ---

function SettingsView({
  onBack,
  onLogout,
}: {
  onBack: () => void;
  onLogout: () => void;
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const settingsItems = [
    {
      icon: Shield,
      label: "Account Settings",
      description: "Manage your email, password, and security",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Customize which alerts you receive",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Access documentation and contact support",
    },
  ];

  return (
    <div className="flex flex-col py-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 px-4 pb-8 lg:px-8">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h1 className="text-2xl font-black text-foreground tracking-tight uppercase tracking-[0.1em]">Control Center</h1>
      </div>

      <div className="flex flex-col gap-4 px-4 lg:px-8 max-w-2xl mx-auto w-full">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-card/40 p-5 transition-all hover:bg-card/60 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground/90 group-hover:text-white transition-colors">
                {item.label}
              </p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
          </button>
        ))}

        <div className="pt-6 border-t border-white/5 mt-4">
          {showLogoutConfirm ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 animate-in zoom-in-95 duration-200">
              <p className="mb-4 text-sm font-bold text-foreground/90 text-center">
                Ready to take a break from the arena?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 rounded-xl"
                  onClick={onLogout}
                >
                  Confirm Logout
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Stay Here
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 transition-all hover:bg-rose-500/10 group w-full"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                <LogOut className="h-6 w-6 text-rose-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-rose-500">Log Out</p>
                <p className="text-[11px] text-muted-foreground/70">Sign out of your session</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Fake engagement numbers deterministically seeded from the challenge id
function fakeCount(seed: string, min: number, max: number): number {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return min + (n % (max - min + 1));
}

function RaisedChallengeCard({
  challenge,
  onDelete,
  onDetails,
}: {
  challenge: YoutubeChallenge;
  onDelete: () => void;
  onDetails: () => void;
}) {
  const thumbnail = getYouTubeThumbnail(challenge.videoUrl, "medium");
  const sdgs = getSDGsByIds(challenge.sdgTags);

  const statusConfig = {
    open: { label: "Seeking Match", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    matched: { label: "Matched", icon: Swords, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    scheduled: { label: "Scheduled", icon: Calendar, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    live: { label: "Live Now", icon: Radio, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  };

  const visibilityConfig = {
    public: {
      icon: GlobeIcon,
      label: "Public",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    private: {
      icon: LockIcon,
      label: "Private",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  };

  const cfg = statusConfig[challenge.status];
  const vis = visibilityConfig[challenge.visibility];
  const StatusIcon = cfg.icon;
  const VisIcon = vis.icon;

  const responses = fakeCount(challenge.id + "r", 2, 38);
  const views = fakeCount(challenge.id + "v", 40, 640);

  const scheduledDate = challenge.scheduledAt
    ? new Date(challenge.scheduledAt).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
    : null;

  return (
    <div className="group relative flex flex-col gap-0 rounded-2xl border border-white/8 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:border-white/15 hover:shadow-lg hover:shadow-black/20 overflow-hidden">

      {/* Compact Thumbnail Banner */}
      <div className="relative h-20 w-full overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-700" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-900/60 to-violet-900/60 flex items-center justify-center">
            <Shield className="h-7 w-7 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top-left: Status badge */}
        <div className="absolute top-2 left-2">
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wide backdrop-blur-md", cfg.color)}>
            <StatusIcon className="h-2.5 w-2.5" />
            {cfg.label}
          </div>
        </div>

        {/* Top-right: Visibility badge */}
        <div className="absolute top-2 right-2">
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wide backdrop-blur-md", vis.color)}>
            <VisIcon className="h-2.5 w-2.5" />
            {vis.label}
          </div>
        </div>

        {/* Bottom-left: SDG dots + time */}
        <div className="absolute bottom-1.5 left-2 flex gap-1">
          {sdgs.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="h-4 w-4 rounded-sm flex items-center justify-center text-[7px] font-black text-white shadow border border-white/20"
              style={{ backgroundColor: s.color }}
              title={s.name}
            >
              {s.id}
            </div>
          ))}
        </div>
        <span className="absolute bottom-1.5 right-2 text-[10px] font-bold text-white/60">
          {challenge.getTimeAgo()}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        {/* Topic */}
        <h4 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {challenge.topic}
        </h4>

        {/* Description */}
        {challenge.description && (
          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2 font-medium">
            {challenge.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {challenge.raisedByRole && (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
              challenge.raisedByRole === "pro"
                ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400"
            )}>
              <Swords className="h-2.5 w-2.5" />
              {challenge.raisedByRole === "pro" ? "PRO" : "CON"}
            </div>
          )}
          {challenge.acceptedBy && (
            <div className="flex items-center gap-1 text-xs font-bold text-foreground/60">
              <User className="h-3 w-3 text-violet-500" />
              <span className="text-violet-600 dark:text-violet-400">{challenge.acceptedBy}</span>
            </div>
          )}
        </div>

        {/* Scheduled time pill */}
        {scheduledDate && (
          <div className="flex items-center gap-1.5 rounded-lg bg-sky-500/8 border border-sky-500/20 px-2.5 py-1.5">
            <Calendar className="h-3 w-3 text-sky-500 shrink-0" />
            <p className="text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wide">
              {scheduledDate}
            </p>
          </div>
        )}

        {/* Engagement stats */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-foreground/50">
            <Swords className="h-3 w-3" />
            {responses}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-foreground/50">
            <GlobeIcon className="h-3 w-3" />
            {views}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 border-t border-foreground/5">
        <div className="flex flex-wrap gap-1">
          {sdgs.map(s => (
            <Badge key={s.id} variant="outline" className="bg-foreground/5 border-foreground/10 text-[9px] font-black tracking-widest uppercase text-foreground/60">
              {s.shortName}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300"
            title="Delete Challenge"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDetails(); }}
            className="h-7 px-2.5 rounded-lg bg-foreground/5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition-all duration-300"
          >
            Details
            <ChevronRight className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- New Modals ---

function SdgPickerModal({
  isOpen,
  onClose,
  selectedIds,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: number[];
  onSelect: (id: number) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-[#0a0a18] border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white tracking-tight">GLOBAL GOALS EXPLORER</DialogTitle>
          <DialogDescription className="text-white/40">Select the SDGs you are passionate about to customize your profile impact.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-6">
          {SDG_GOALS.map((sdg) => {
            const isSelected = selectedIds.includes(sdg.id);
            return (
              <button
                key={sdg.id}
                onClick={() => onSelect(sdg.id)}
                className={cn(
                  "relative group flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left",
                  isSelected
                    ? "bg-white/10 border-white/30 shadow-lg shadow-black/20"
                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <div
                  className="h-10 w-10 rounded-xl mb-3 flex items-center justify-center font-black text-lg shadow-inner"
                  style={{ backgroundColor: sdg.color, color: "#fff" }}
                >
                  {sdg.id}
                </div>
                <p className="text-xs font-black text-white/90 leading-tight mb-1 uppercase tracking-tight">{sdg.shortName}</p>
                <p className="text-[9px] text-white/40 leading-relaxed line-clamp-2">{sdg.name}</p>

                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold uppercase tracking-widest text-xs">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DebateSummaryModal({
  record,
  onClose
}: {
  record: DebateHistory | null;
  onClose: () => void;
}) {
  if (!record) return null;

  const sdgs = getSDGsByIds(record.sdgTags);
  const resultColors = {
    win: "text-emerald-500",
    loss: "text-rose-500",
    draw: "text-amber-500"
  };

  return (
    <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-[#0a0a18] border-white/10 p-0 overflow-hidden rounded-[2rem]">
        {/* Header Section */}
        <div className="relative p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-violet-900/40 to-purple-900/40" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sdgs.map(s => (
                  <Badge key={s.id} variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black tracking-widest uppercase text-white">
                    {s.shortName}
                  </Badge>
                ))}
              </div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                {record.getFormattedDate()}
              </div>
            </div>

            <DialogHeader className="text-left space-y-0">
              <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight">
                {record.topicTitle}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed summary and analytics for the debate on {record.topicTitle}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Result</p>
                <p className={cn("text-xl font-black uppercase tracking-widest", resultColors[record.result])}>
                  {record.getResultLabel()}
                </p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Final Score</p>
                <p className="text-xl font-black text-white">{record.getScoreDisplay()}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Opponent</p>
                <p className="text-xl font-black text-white/90">{record.opponentName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8 bg-card/10 backdrop-blur-3xl">
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> AI Judge's Verdict
            </h3>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-5 leading-relaxed text-sm text-white/70 italic">
              "A masterful display of critical thinking. Your rebuttal on the second round regarding resource allocation in renewable energy sectors was the turning point. The opponent lacked specific data to counter your claims on long-term sustainability ROI."
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-emerald-500" /> Strongest Arguments
              </h3>
              <ul className="space-y-2">
                {[
                  "Empirical evidence on renewable energy costs",
                  "The socio-economic impact on local communities",
                  "Scalability of hydrogen fuel cells"
                ].map((arg, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-500" /> Performance Analysis
              </h3>
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-white/40 uppercase">Clarity</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[92%]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-white/40 uppercase">Relevance</span>
                    <span className="text-white">88%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[88%]" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-4">
            <Button onClick={onClose} variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs h-12 rounded-2xl">
              Close Analytics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Raised Challenge Detail Modal (inline) ────────────────────────────────

function RaisedChallengeDetailModal({
  challenge,
  onClose,
}: {
  challenge: YoutubeChallenge | null;
  onClose: () => void;
}) {
  if (!challenge) return null;

  const thumbnail = getYouTubeThumbnail(challenge.videoUrl, "medium");
  const sdgs = getSDGsByIds(challenge.sdgTags);

  const STATUS_CFG: Record<string, { label: string; color: string }> = {
    open: { label: "Seeking Challenger", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    matched: { label: "Matched", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    scheduled: { label: "Scheduled", color: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
    live: { label: "Live Now", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
    completed: { label: "Completed", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  };
  const cfg = STATUS_CFG[challenge.status] ?? STATUS_CFG.open;

  return (
    <Dialog open={!!challenge} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Challenge Details</DialogTitle>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] shadow-2xl">
          {/* Accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Thumbnail */}
          {thumbnail && (
            <div className="relative h-36 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnail} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-black/40 to-transparent" />
            </div>
          )}

          <div className="flex flex-col gap-4 p-5 pt-3">
            {/* Status + Topic */}
            <div>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold mb-2", cfg.color)}>
                {cfg.label}
              </span>
              <h2 className="text-base font-bold text-white leading-snug pr-6">{challenge.topic}</h2>
              {challenge.description && (
                <p className="mt-1 text-xs text-white/50 leading-relaxed line-clamp-3">{challenge.description}</p>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col gap-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wide">Your Side</p>
                <p className={cn("text-sm font-bold", challenge.raisedByRole === "pro" ? "text-violet-400" : "text-rose-400")}>
                  {challenge.raisedByRole === "pro" ? "⚔️ PRO – Supporter" : "🛡️ CON – Rebuttal"}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col gap-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wide">Visibility</p>
                <p className={cn("text-sm font-bold", challenge.visibility === "public" ? "text-emerald-400" : "text-amber-400")}>
                  {challenge.visibility === "public" ? "🌐 Public" : "🔒 Private"}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col gap-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wide">Raised</p>
                <p className="text-xs text-white/70">{challenge.getTimeAgo()}</p>
              </div>
              {challenge.acceptedBy ? (
                <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col gap-1">
                  <p className="text-[10px] text-white/40 uppercase tracking-wide">Opponent</p>
                  <p className="text-xs font-semibold text-white/80">{challenge.acceptedBy}</p>
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col gap-1">
                  <p className="text-[10px] text-white/40 uppercase tracking-wide">Opponent</p>
                  <p className="text-xs text-white/30 italic">Awaiting challenger…</p>
                </div>
              )}
            </div>

            {/* SDG Tags */}
            {sdgs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sdgs.map((sdg) => (
                  <span
                    key={sdg.id}
                    className="rounded-md px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: sdg.color }}
                  >
                    SDG {sdg.id} · {sdg.shortName}
                  </span>
                ))}
              </div>
            )}

            {/* Scheduled time */}
            {challenge.scheduledAt && (
              <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 px-3 py-2.5 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wide">Scheduled For</p>
                  <p className="text-xs font-semibold text-sky-300">
                    {new Date(challenge.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white text-sm mt-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
