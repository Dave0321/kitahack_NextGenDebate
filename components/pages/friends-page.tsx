"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  subscribeFriends,
  getMyFriendCode,
  addFriendByCode,
  removeFriend,
} from "@/lib/friend-service";
import { useAuth } from "@/hooks/useAuth";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { cn } from "@/lib/utils";
import type { Friend } from "@/lib/models/friend";
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
  UserPlus,
  Loader2,
} from "lucide-react";

interface FriendsPageProps {
  onBack: () => void;
  initialInviteCode?: string;
}

type FriendsView = "list" | "qr" | "add";

export function FriendsPage({ onBack, initialInviteCode }: FriendsPageProps) {
  const { user } = useAuth();
  const [view, setView] = useState<FriendsView>(
    initialInviteCode ? "add" : "list"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCode, setFriendCode] = useState<string | null>(null);
  const [addCodeInput, setAddCodeInput] = useState(
    initialInviteCode?.toUpperCase() ?? ""
  );
  const [addCodeLoading, setAddCodeLoading] = useState(false);
  const [addCodeError, setAddCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeFriends(user.uid, setFriends);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user || view !== "qr") return;
    getMyFriendCode(user.uid).then(setFriendCode).catch(() => setFriendCode(null));
  }, [user, view]);

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

  const handleAddByCode = async () => {
    if (!user || !addCodeInput.trim()) return;
    setAddCodeError(null);
    setAddCodeLoading(true);
    try {
      await addFriendByCode(user.uid, addCodeInput.trim());
      setAddCodeInput("");
      setView("list");
    } catch (e) {
      setAddCodeError(e instanceof Error ? e.message : "Failed to add friend");
    } finally {
      setAddCodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <button
            onClick={() => {
              setView("add");
              setAddCodeError(null);
              setAddCodeInput("");
            }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              view === "add"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary"
            )}
            aria-label="Add friend"
          >
            <UserPlus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 lg:px-8">
        {view === "qr" ? (
          <QRCodeView friendCode={friendCode} />
        ) : view === "add" ? (
          <AddByCodeView
            addCodeInput={addCodeInput}
            setAddCodeInput={setAddCodeInput}
            addCodeLoading={addCodeLoading}
            addCodeError={addCodeError}
            onAdd={handleAddByCode}
            onBack={() => setView("list")}
          />
        ) : (
          <>
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

            <p className="mb-3 text-xs text-muted-foreground">
              {filteredFriends.length} friend
              {filteredFriends.length !== 1 ? "s" : ""}
            </p>

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
                      : "No friends yet. Add by code or share your code!"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <FriendProfileModal
        friend={selectedFriend}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onRemove={
          user && selectedFriend
            ? () =>
                removeFriend(user.uid, selectedFriend.id).then(() =>
                  setProfileOpen(false)
                )
            : undefined
        }
      />
    </div>
  );
}

// --- Add by code view ---

function AddByCodeView({
  addCodeInput,
  setAddCodeInput,
  addCodeLoading,
  addCodeError,
  onAdd,
  onBack,
}: {
  addCodeInput: string;
  setAddCodeInput: (v: string) => void;
  addCodeLoading: boolean;
  addCodeError: string | null;
  onAdd: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">Add Friend by Code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your friend&apos;s code (e.g. DEBATE-ABC123) to add them.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          placeholder="DEBATE-XXXXXX"
          value={addCodeInput}
          onChange={(e) => setAddCodeInput(e.target.value.toUpperCase())}
          className="font-mono text-center"
          disabled={addCodeLoading}
        />
        {addCodeError && (
          <p className="text-xs text-destructive">{addCodeError}</p>
        )}
        <Button
          onClick={onAdd}
          disabled={!addCodeInput.trim() || addCodeLoading}
          className="w-full"
        >
          {addCodeLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Add Friend
            </>
          )}
        </Button>
      </div>

      <Button variant="outline" onClick={onBack}>
        Back to list
      </Button>
    </div>
  );
}

// --- QR Code View ---

function QRCodeView({ friendCode }: { friendCode: string | null }) {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopyCode = () => {
    if (!friendCode) return;
    navigator.clipboard.writeText(friendCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (!friendCode || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(friendCode)}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">Your Friend Code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share this code so others can add you as a friend.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 w-full max-w-xs">
        <div className="flex h-52 w-52 items-center justify-center rounded-xl bg-foreground p-4">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <rect width="200" height="200" fill="white" />
            <rect x="10" y="10" width="50" height="50" fill="black" />
            <rect x="15" y="15" width="40" height="40" fill="white" />
            <rect x="20" y="20" width="30" height="30" fill="black" />
            <rect x="140" y="10" width="50" height="50" fill="black" />
            <rect x="145" y="15" width="40" height="40" fill="white" />
            <rect x="150" y="20" width="30" height="30" fill="black" />
            <rect x="10" y="140" width="50" height="50" fill="black" />
            <rect x="15" y="145" width="40" height="40" fill="white" />
            <rect x="20" y="150" width="30" height="30" fill="black" />
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
          </svg>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 w-full justify-center">
          <span className="text-sm font-mono font-semibold text-foreground">
            {friendCode ?? "Loading…"}
          </span>
          <button
            onClick={handleCopyCode}
            disabled={!friendCode}
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

      <Button
        variant="outline"
        className="w-full max-w-xs"
        onClick={handleShareLink}
        disabled={!friendCode}
      >
        <Share2 className="h-4 w-4" />
        {shareCopied ? "Link Copied!" : "Share Invite Link"}
      </Button>
    </div>
  );
}

// --- Friend Profile Modal ---

function FriendProfileModal({
  friend,
  open,
  onClose,
  onRemove,
}: {
  friend: Friend | null;
  open: boolean;
  onClose: () => void;
  onRemove?: () => void | Promise<void>;
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
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
            <User className="h-10 w-10 text-primary" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">
              {friend.getDisplayName()}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{friend.bio}</p>
          </div>

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

          <p className="text-xs text-muted-foreground">
            Friends since{" "}
            {new Date(friend.addedAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="flex w-full gap-2">
            {onRemove && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onRemove()}
              >
                Remove Friend
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
