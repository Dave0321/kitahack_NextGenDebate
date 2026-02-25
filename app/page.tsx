"use client";
import { AdminPage } from "@/components/pages/admin-page"; // Add import
import { useState } from "react";
import { AuthPage } from "@/components/pages/auth-page";
import { AppShell } from "@/components/app-shell";
import { BrowsePage } from "@/components/pages/browse-page";
import { LearningHubPage } from "@/components/pages/learning-hub-page";
import { ProfilePage } from "@/components/pages/profile-page";
import { ProfileSetup } from "@/components/onboarding/profile-setup";
import {
  UserProfile,
  createBlankProfile,
  type UserProfileData,
} from "@/lib/models/user-profile";
import type { YoutubeChallenge } from "@/lib/models/youtube-challenge";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add this
  const [userProfile, setUserProfile] = useState<UserProfile>(
    createBlankProfile()
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [debateChallenge, setDebateChallenge] = useState<YoutubeChallenge | null>(null);
  const [debateUserRole, setDebateUserRole] = useState<"pro" | "con" | null>(null);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setIsAdmin(email === "admin@debateme.com"); // Check if admin
    if (!userProfile.hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowOnboarding(false);
    setUserProfile(createBlankProfile());
  };

  const handleOnboardingComplete = (updates: Partial<UserProfileData>) => {
    userProfile.updateProfile(updates);
    setUserProfile(
      new UserProfile({ ...userProfile } as UserProfileData)
    );
    setShowOnboarding(false);
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <>
      {showOnboarding && (
        <ProfileSetup onComplete={handleOnboardingComplete} />
      )}
      <AppShell
      isAdmin={isAdmin} // Pass this down
        adminContent={<AdminPage />} // Pass this down
        browseContent={<BrowsePage onEnterDebateRoom={(challenge, role) => { setDebateChallenge(challenge); setDebateUserRole(role ?? null); }} />}
        learningHubContent={<LearningHubPage />}
        profileContent={
          <ProfilePage userProfile={userProfile} onLogout={handleLogout} />
        }
        userProfile={userProfile}
        debateChallenge={debateChallenge}
        onExitDebateRoom={() => { setDebateChallenge(null); setDebateUserRole(null); }}
        userRole={debateUserRole}
      />
    </>
  );
}
