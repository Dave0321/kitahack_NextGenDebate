"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/lib/models/user-profile";
import {
  getDebateHistory,
  getWinCount,
  getLossCount,
  getTotalDebates,
  type DebateHistory,
} from "@/lib/models/debate-history";
import { getSDGsByIds } from "@/lib/data/sdg-data";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type View = "profile" | "settings";

interface ProfilePageProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export function ProfilePage({ userProfile, onLogout }: ProfilePageProps) {
  const [view, setView] = useState<View>("profile");
  const [username, setUsername] = useState(userProfile.getDisplayName());
  const [bio, setBio] = useState(
    userProfile.bio ||
      "Passionate about critical thinking and sustainable development."
  );
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(username);
  const [editBio, setEditBio] = useState(bio);

  const debateHistory = getDebateHistory();
  const totalDebates = getTotalDebates();
  const wins = getWinCount();
  const losses = getLossCount();

  const handleSave = () => {
    setUsername(editUsername.trim() || username);
    setBio(editBio.trim() || bio);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditUsername(username);
    setEditBio(bio);
    setEditing(false);
  };

  if (view === "settings") {
    return <SettingsView onBack={() => setView("profile")} onLogout={onLogout} />;
  }

  return (
    <div className="flex flex-col py-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 px-4 pb-8 lg:px-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
          <User className="h-12 w-12 text-primary" />
        </div>

        {editing ? (
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Check className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{username}</h2>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground text-pretty">
                {bio}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditUsername(username);
                setEditBio(bio);
                setEditing(true);
              }}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mx-4 mb-6 grid grid-cols-3 gap-4 rounded-xl border bg-card p-4 lg:mx-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-foreground">
            {totalDebates}
          </span>
          <span className="text-xs text-muted-foreground">Debates</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-foreground">{wins}</span>
          <span className="text-xs text-muted-foreground">Wins</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-foreground">{losses}</span>
          <span className="text-xs text-muted-foreground">Losses</span>
        </div>
      </div>

      {/* Debate History Section */}
      <div className="px-4 lg:px-8 mb-6">
        <h3 className="mb-3 text-base font-bold text-foreground">
          Debate History
        </h3>
        <div className="flex flex-col gap-2">
          {debateHistory.slice(0, 5).map((record) => (
            <DebateHistoryItem key={record.id} record={record} />
          ))}
          {debateHistory.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Showing 5 of {debateHistory.length} debates
            </p>
          )}
          {debateHistory.length === 0 && (
            <div className="rounded-xl border bg-card p-6 text-center">
              <Swords className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No debates yet. Start your first debate!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings button */}
      <div className="px-4 lg:px-8">
        <button
          onClick={() => setView("settings")}
          className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Settings</p>
            <p className="text-xs text-muted-foreground">
              Account, notifications, and more
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// --- Debate History Item ---

function DebateHistoryItem({ record }: { record: DebateHistory }) {
  const sdgs = getSDGsByIds(record.sdgTags);
  const resultStyles = {
    win: "bg-emerald-500/10 text-emerald-600",
    loss: "bg-red-500/10 text-red-500",
    draw: "bg-amber-500/10 text-amber-600",
  };
  const ResultIcon =
    record.result === "win"
      ? Trophy
      : record.result === "loss"
        ? X
        : Minus;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-secondary/50">
      {/* Result icon */}
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
          resultStyles[record.result]
        )}
      >
        <ResultIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {record.topicTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            vs {record.opponentName}
          </span>
          <span className="text-xs text-muted-foreground">
            {record.getScoreDisplay()}
          </span>
        </div>
      </div>

      {/* Date & duration */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-md",
            resultStyles[record.result]
          )}
        >
          {record.getResultLabel()}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {record.getDurationLabel()}
        </div>
      </div>
    </div>
  );
}

// --- Settings View ---

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
      description: "Manage your account details",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Configure notification preferences",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help with DebateMe",
    },
  ];

  return (
    <div className="flex flex-col py-6">
      <div className="flex items-center gap-3 px-4 pb-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex flex-col gap-2 px-4 lg:px-8">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        {showLogoutConfirm ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-4">
            <p className="mb-3 text-sm font-medium text-foreground">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={onLogout}
              >
                Yes, Log Out
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-card p-4 transition-colors hover:bg-destructive/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-destructive">Log Out</p>
              <p className="text-xs text-muted-foreground">
                Sign out of your account
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
