"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SDG_GOALS } from "@/lib/data/sdg-data";
import {
  APP_USAGE_REASONS,
  type UserProfileData,
} from "@/lib/models/user-profile";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Check,
  SkipForward,
  User,
  Target,
  Globe,
} from "lucide-react";

interface ProfileSetupProps {
  onComplete: (profile: Partial<UserProfileData>) => void;
}

type Step = 1 | 2 | 3 | 4;

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState<Step>(1);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [reason, setReason] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);

  const toggleSdg = (id: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    onComplete({
      nickname: nickname.trim(),
      bio: bio.trim(),
      reasonForUsing: reason,
      interestedSdgs: selectedSdgs,
      isProfileComplete: true,
    });
  };

  const canProceedStep1 = nickname.trim().length >= 2;
  const canProceedStep3 = reason.length > 0;
  const canProceedStep4 = selectedSdgs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex h-1.5 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Logo area */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Step {step} of 4
              </p>
              <h2 className="text-lg font-bold text-foreground">
                {step === 1 && "Set Your Nickname"}
                {step === 2 && "Tell Us About You"}
                {step === 3 && "Why Are You Here?"}
                {step === 4 && "Choose Your Interests"}
              </h2>
            </div>
          </div>

          {/* Step 1: Nickname */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <User className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Pick a nickname that other debaters will see.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="setup-nickname">Nickname</Label>
                <Input
                  id="setup-nickname"
                  placeholder="e.g. CriticalThinker42"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={24}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {nickname.length}/24 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Bio (skippable) */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Write a short bio about yourself. This is optional and you can
                always update it later.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="setup-bio">Bio</Label>
                <Textarea
                  id="setup-bio"
                  placeholder="Tell others a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={160}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/160 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Reason for using */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                This helps us personalize your experience.
              </p>
              <div className="flex flex-col gap-2">
                {APP_USAGE_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition-all",
                      reason === r
                        ? "border-primary bg-primary/5 text-primary"
                        : "bg-card text-foreground hover:bg-secondary"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        reason === r
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {reason === r && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Interested SDGs */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Select the SDG topics you are most interested in debating about.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-xl border p-2">
                {SDG_GOALS.map((sdg) => {
                  const isSelected = selectedSdgs.includes(sdg.id);
                  return (
                    <button
                      key={sdg.id}
                      onClick={() => toggleSdg(sdg.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-all",
                        isSelected
                          ? "text-white ring-2 ring-offset-1"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                      style={
                        isSelected
                          ? {
                              backgroundColor: sdg.color,
                              ringColor: sdg.color,
                            }
                          : undefined
                      }
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {sdg.id}. {sdg.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {selectedSdgs.length} selected
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((step - 1) as Step)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {/* Skip button for bio step */}
              {step === 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(3)}
                  className="text-muted-foreground"
                >
                  Skip
                  <SkipForward className="h-3.5 w-3.5" />
                </Button>
              )}

              {step < 4 ? (
                <Button
                  size="sm"
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 3 && !canProceedStep3)
                  }
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  disabled={!canProceedStep4}
                >
                  <Check className="h-4 w-4" />
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
