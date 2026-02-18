// OOP-based Friend model
// Manages friend list and friend profiles

export interface FriendData {
  id: string;
  nickname: string;
  bio: string;
  avatarUrl?: string;
  debatesCount: number;
  winsCount: number;
  interestedSdgs: number[];
  addedAt: string;
}

export class Friend implements FriendData {
  id: string;
  nickname: string;
  bio: string;
  avatarUrl?: string;
  debatesCount: number;
  winsCount: number;
  interestedSdgs: number[];
  addedAt: string;

  constructor(data: FriendData) {
    this.id = data.id;
    this.nickname = data.nickname;
    this.bio = data.bio;
    this.avatarUrl = data.avatarUrl;
    this.debatesCount = data.debatesCount;
    this.winsCount = data.winsCount;
    this.interestedSdgs = data.interestedSdgs;
    this.addedAt = data.addedAt;
  }

  getDisplayName(): string {
    return this.nickname || "Unknown User";
  }

  getWinRate(): string {
    if (this.debatesCount === 0) return "0%";
    return Math.round((this.winsCount / this.debatesCount) * 100) + "%";
  }

  getBioPreview(): string {
    if (!this.bio) return "No bio";
    return this.bio.length > 60 ? this.bio.substring(0, 60) + "..." : this.bio;
  }
}

// ============================================================
// DUMMY FRIEND DATA - Manually add/remove friends here
// ============================================================

const friendsData: FriendData[] = [
  {
    id: "friend-1",
    nickname: "CriticalThinker42",
    bio: "Philosophy student who loves constructive arguments",
    debatesCount: 28,
    winsCount: 19,
    interestedSdgs: [4, 16],
    addedAt: "2026-01-15",
  },
  {
    id: "friend-2",
    nickname: "GreenAdvocate",
    bio: "Environmental science major passionate about climate action",
    debatesCount: 15,
    winsCount: 10,
    interestedSdgs: [13, 15],
    addedAt: "2026-01-20",
  },
  {
    id: "friend-3",
    nickname: "DebateChamp2026",
    bio: "National debate champion. Always up for a challenge!",
    debatesCount: 45,
    winsCount: 38,
    interestedSdgs: [1, 10],
    addedAt: "2026-02-01",
  },
  {
    id: "friend-4",
    nickname: "SDGExplorer",
    bio: "Exploring all 17 SDGs one debate at a time",
    debatesCount: 20,
    winsCount: 12,
    interestedSdgs: [2, 6],
    addedAt: "2026-02-05",
  },
  {
    id: "friend-5",
    nickname: "LogicMaster",
    bio: "Math teacher who applies logic to everything",
    debatesCount: 32,
    winsCount: 25,
    interestedSdgs: [9, 4],
    addedAt: "2026-02-10",
  },
];

// Instantiate all friends
export const friends: Friend[] = friendsData.map(
  (data) => new Friend(data)
);

// Helper functions
export function getFriendById(id: string): Friend | undefined {
  return friends.find((f) => f.id === id);
}

export function addFriend(data: FriendData): Friend {
  const friend = new Friend(data);
  friends.push(friend);
  return friend;
}

export function removeFriend(id: string): boolean {
  const index = friends.findIndex((f) => f.id === id);
  if (index !== -1) {
    friends.splice(index, 1);
    return true;
  }
  return false;
}

export function getAllFriends(): Friend[] {
  return [...friends];
}
