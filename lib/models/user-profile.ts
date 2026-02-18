// OOP-based UserProfile model
// Manages user profile data including onboarding state

export interface UserProfileData {
  id: string;
  nickname: string;
  bio: string;
  reasonForUsing: string;
  interestedSdgs: number[];
  avatarUrl?: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export class UserProfile implements UserProfileData {
  id: string;
  nickname: string;
  bio: string;
  reasonForUsing: string;
  interestedSdgs: number[];
  avatarUrl?: string;
  isProfileComplete: boolean;
  createdAt: string;

  constructor(data: UserProfileData) {
    this.id = data.id;
    this.nickname = data.nickname;
    this.bio = data.bio;
    this.reasonForUsing = data.reasonForUsing;
    this.interestedSdgs = data.interestedSdgs;
    this.avatarUrl = data.avatarUrl;
    this.isProfileComplete = data.isProfileComplete;
    this.createdAt = data.createdAt;
  }

  getDisplayName(): string {
    return this.nickname || "New User";
  }

  getBioPreview(): string {
    if (!this.bio) return "No bio yet";
    return this.bio.length > 80 ? this.bio.substring(0, 80) + "..." : this.bio;
  }

  hasCompletedOnboarding(): boolean {
    return this.isProfileComplete;
  }

  updateProfile(updates: Partial<UserProfileData>): void {
    Object.assign(this, updates);
  }
}

// ============================================================
// REASONS FOR USING THE APP
// ============================================================

export const APP_USAGE_REASONS = [
  "Improve my debating skills",
  "Learn about SDGs",
  "Prepare for competitions",
  "Academic research",
  "Personal growth & critical thinking",
  "Just exploring",
] as const;

export type AppUsageReason = (typeof APP_USAGE_REASONS)[number];

// Factory for creating a new blank profile after registration
export function createBlankProfile(): UserProfile {
  return new UserProfile({
    id: `user-${Date.now()}`,
    nickname: "",
    bio: "",
    reasonForUsing: "",
    interestedSdgs: [],
    isProfileComplete: false,
    createdAt: new Date().toISOString(),
  });
}

// Factory for creating a default/demo profile
export function createDefaultProfile(): UserProfile {
  return new UserProfile({
    id: "user-demo",
    nickname: "DebateEnthusiast",
    bio: "Passionate about critical thinking and sustainable development. Let's debate!",
    reasonForUsing: "Improve my debating skills",
    interestedSdgs: [4, 13],
    isProfileComplete: true,
    createdAt: "2026-01-01",
  });
}
