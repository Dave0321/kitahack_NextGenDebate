"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SDG_GOALS } from "@/lib/data/sdg-data";
import {
  type UserProfileData,
} from "@/lib/models/user-profile";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Check,
  Globe,
} from "lucide-react";

interface ProfileSetupProps {
  onComplete: (profile: Partial<UserProfileData>) => void;
}


export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);

  const toggleSdg = (id: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    onComplete({
      nickname: "Debater_" + Math.floor(Math.random() * 1000),
      bio: "Joined the debate!",
      reasonForUsing: "Improve my debating skills",
      interestedSdgs: selectedSdgs,
      isProfileComplete: true,
    });
  };

  const canProceed = selectedSdgs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-xl overflow-hidden">
        <div className="p-6">
          {/* Logo area */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Choose Your Interests
              </h2>
              <p className="text-xs font-medium text-muted-foreground">
                Select the SDG topics you want to debate
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Select the topics that matter most to you.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-xl border p-2">
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
                          boxShadow: `0 0 0 2px ${sdg.color}44`,
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

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-end">
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={!canProceed}
              className="w-full sm:w-auto"
            >
              <Check className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
