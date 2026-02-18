"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAllFriends, type Friend } from "@/lib/models/friend";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  QrCode,
  Users,
  User,
  Search,
  Trophy,
  Swords,
  X,
  Copy,
  Share2,
} from "lucide-react";

interface FriendsPageProps {
  onBack: () => void;
}

type FriendsView = "list" | "qr";

export function FriendsPage({ onBack }: FriendsPageProps) {
  const [view, setView] = useState<FriendsView>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const friends = getAllFriends();

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    return friends.filter((f) =>
      f.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const openProfile = (friend: Friend) => {
    setSelectedFriend(friend);
    setProfileOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 lg:px-8">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-foreground">Friends</h1>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              view === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary"
            )}
            aria-label="Friend list"
          >
            <Users className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setView("qr")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              view === "qr"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary"
            )}
            aria-label="QR code"
          >
            <QrCode className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 lg:px-8">
        {view === "qr" ? (
          <QRCodeView />
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Friend count */}
            <p className="mb-3 text-xs text-muted-foreground">
              {filteredFriends.length} friend
              {filteredFriends.length !== 1 ? "s" : ""}
            </p>

            {/* Friend list */}
            <div className="flex flex-col gap-2">
              {filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => openProfile(friend)}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {friend.getDisplayName()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {friend.getBioPreview()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-xs font-medium text-foreground">
                      {friend.getWinRate()} WR
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {friend.debatesCount} debates
                    </span>
                  </div>
                </button>
              ))}

              {filteredFriends.length === 0 && (
                <div className="rounded-xl border bg-card p-8 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No friends match your search."
                      : "No friends yet. Share your QR code to add friends!"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Friend Profile Modal */}
      <FriendProfileModal
        friend={selectedFriend}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

// --- QR Code View ---

function QRCodeView() {
  const [copied, setCopied] = useState(false);
  const friendCode = "DEBATE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(friendCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">Your QR Code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Let others scan this code to add you as a friend.
        </p>
      </div>

      {/* QR Code placeholder */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6">
        <div className="flex h-52 w-52 items-center justify-center rounded-xl bg-foreground p-4">
          {/* SVG QR pattern */}
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <rect width="200" height="200" fill="white" />
            {/* Top-left position pattern */}
            <rect x="10" y="10" width="50" height="50" fill="black" />
            <rect x="15" y="15" width="40" height="40" fill="white" />
            <rect x="20" y="20" width="30" height="30" fill="black" />
            {/* Top-right position pattern */}
            <rect x="140" y="10" width="50" height="50" fill="black" />
            <rect x="145" y="15" width="40" height="40" fill="white" />
            <rect x="150" y="20" width="30" height="30" fill="black" />
            {/* Bottom-left position pattern */}
            <rect x="10" y="140" width="50" height="50" fill="black" />
            <rect x="15" y="145" width="40" height="40" fill="white" />
            <rect x="20" y="150" width="30" height="30" fill="black" />
            {/* Data modules - pseudo random pattern */}
            {Array.from({ length: 15 }, (_, row) =>
              Array.from({ length: 15 }, (_, col) => {
                const x = 70 + col * 8;
                const y = 10 + row * 8;
                const show = (row * 7 + col * 11 + row * col) % 3 !== 0;
                if (x > 130 && y < 65) return null;
                if (x < 65 && y > 130) return null;
                if (x < 65 && y < 65) return null;
                return show ? (
                  <rect
                    key={`${row}-${col}`}
                    x={x}
                    y={y}
                    width="6"
                    height="6"
                    fill="black"
                  />
                ) : null;
              })
            )}
            {/* Some extra random modules */}
            <rect x="10" y="70" width="6" height="6" fill="black" />
            <rect x="10" y="86" width="6" height="6" fill="black" />
            <rect x="18" y="78" width="6" height="6" fill="black" />
            <rect x="26" y="70" width="6" height="6" fill="black" />
            <rect x="34" y="86" width="6" height="6" fill="black" />
            <rect x="42" y="70" width="6" height="6" fill="black" />
            <rect x="50" y="78" width="6" height="6" fill="black" />
            <rect x="70" y="140" width="6" height="6" fill="black" />
            <rect x="86" y="148" width="6" height="6" fill="black" />
            <rect x="94" y="140" width="6" height="6" fill="black" />
            <rect x="110" y="156" width="6" height="6" fill="black" />
            <rect x="118" y="148" width="6" height="6" fill="black" />
            <rect x="126" y="164" width="6" height="6" fill="black" />
          </svg>
        </div>

        {/* Friend code */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
          <span className="text-sm font-mono font-semibold text-foreground">
            {friendCode}
          </span>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy friend code"
          >
            {copied ? (
              <span className="text-xs text-primary font-medium">Copied</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Share button */}
      <Button variant="outline" className="w-full max-w-xs">
        <Share2 className="h-4 w-4" />
        Share Invite Link
      </Button>
    </div>
  );
}

// --- Friend Profile Modal ---

function FriendProfileModal({
  friend,
  open,
  onClose,
}: {
  friend: Friend | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!friend) return null;

  const sdgs = getSDGsByIds(friend.interestedSdgs);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {friend.getDisplayName()} Profile
          </DialogTitle>
          <DialogDescription className="sr-only">
            Profile details for {friend.getDisplayName()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
            <User className="h-10 w-10 text-primary" />
          </div>

          {/* Name & Bio */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">
              {friend.getDisplayName()}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{friend.bio}</p>
          </div>

          {/* Stats */}
          <div className="grid w-full grid-cols-3 gap-3 rounded-xl bg-secondary/50 p-4">
            <div className="flex flex-col items-center gap-1">
              <Swords className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-bold text-foreground">
                {friend.debatesCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Debates
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-bold text-foreground">
                {friend.winsCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Wins</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                WR
              </span>
              <span className="text-base font-bold text-foreground">
                {friend.getWinRate()}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Win Rate
              </span>
            </div>
          </div>

          {/* Interested SDGs */}
          {sdgs.length > 0 && (
            <div className="w-full">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Interested Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {sdgs.map((sdg) => (
                  <span
                    key={sdg.id}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: sdg.color }}
                  >
                    SDG {sdg.id}: {sdg.shortName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Added date */}
          <p className="text-xs text-muted-foreground">
            Friends since{" "}
            {new Date(friend.addedAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
