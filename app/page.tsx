"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthPage } from "@/components/pages/auth-page";
import { auth } from "@/lib/firebase";
import { AppShell } from "@/components/app-shell";
import { BrowsePage } from "@/components/pages/browse-page";
import { LearningHubPage } from "@/components/pages/learning-hub-page";
import { ProfilePage } from "@/components/pages/profile-page";
import { ProfileSetup } from "@/components/onboarding/profile-setup";
import {
  UserProfile,
  type UserProfileData,
} from "@/lib/models/user-profile";
import {useAuth} from "@/hooks/useAuth";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";


export default function Home() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  //load profile from firestore 
  useEffect(
    () => {
      if(!user) {
        setUserProfile(null);
        setShowOnboarding(false);
        return;
      }

      const load = async() => {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if(!snap.exists()) return;

        const data = snap.data() as Partial<UserProfileData> & {id?:string};
        const full: UserProfileData = {
          id: user.uid,
          nickname: data.nickname || "",
          bio: data.bio ?? "",
          reasonForUsing: data.reasonForUsing ?? "",
          interestedSdgs: data.interestedSdgs ?? [],
          avatarUrl: data.avatarUrl,
          isProfileComplete: data.isProfileComplete ?? false,
          createdAt: data.createdAt ?? new Date().toISOString(),
        };
        const profile = new UserProfile(full);
        setUserProfile(profile);
        setShowOnboarding(!profile.isProfileComplete);
      };
      void load();
    }, [user]);

  const handleOnboardingComplete = async (updates: Partial<UserProfileData>) => {
    if(!user || !userProfile) return;

    const updated = new UserProfile({
      ...(userProfile as UserProfileData),
      ...updates,
    });
    setUserProfile(updated);

    const ref = doc(db, "users", user.uid);
    await setDoc(
      ref, 
      {
        nickname: updated.nickname, 
        bio: updated.bio,
        reasonForUsing: updated.reasonForUsing,
        interestedSdgs: updated.interestedSdgs,
        isProfileComplete: updated.isProfileComplete,
      },
      {merge: true}
    );
    setShowOnboarding(false);

  };

  if(loading) {
    return <div className = "flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if(!user){
    return <AuthPage onLogin={() => {}} />;
  }

  if(!userProfile){
    return <div className = "flex min-h-screen items-center justify-center">Loading profile...</div>;
  }

  return(
    <>
    
    {showOnboarding && (
      <ProfileSetup onComplete={handleOnboardingComplete} />
    )}
    <AppShell
      browseContent={<BrowsePage />}
      learningHubContent={<LearningHubPage />}
      profileContent={<ProfilePage userProfile={userProfile} onLogout={() => auth.signOut()} />}
      userProfile={userProfile}
      initialFriendsInvite={inviteCode ?? undefined}
    />
    </>
  )
}
