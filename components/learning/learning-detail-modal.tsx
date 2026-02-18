"use client";

import type { LearningCard } from "@/lib/models/learning-card";
import { getSDGById } from "@/lib/data/sdg-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Globe,
} from "lucide-react";

interface LearningDetailModalProps {
  card: LearningCard | null;
  open: boolean;
  onClose: () => void;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "logical-fallacy":
      return Brain;
    case "sdg":
      return Globe;
    case "general-lesson":
      return GraduationCap;
    default:
      return BookOpen;
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "logical-fallacy":
      return "Logical Fallacy";
    case "sdg":
      return "SDG Learning";
    case "general-lesson":
      return "General Lesson";
    default:
      return "Learning";
  }
}

export function LearningDetailModal({
  card,
  open,
  onClose,
}: LearningDetailModalProps) {
  if (!card) return null;

  const Icon = getCategoryIcon(card.category);
  const sdg = card.sdgId ? getSDGById(card.sdgId) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{card.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Learning details for {card.title}
          </DialogDescription>
        </DialogHeader>

        {/* Category badge + icon */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={
              sdg
                ? { backgroundColor: sdg.color + "20", color: sdg.color }
                : undefined
            }
          >
            <Icon
              className="h-5 w-5"
              style={
                !sdg ? { color: "var(--color-primary)" } : { color: sdg.color }
              }
            />
          </div>
          <div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-md"
              style={
                sdg
                  ? { backgroundColor: sdg.color, color: "#fff" }
                  : {
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    }
              }
            >
              {getCategoryLabel(card.category)}
            </span>
            {sdg && (
              <p className="mt-1 text-xs text-muted-foreground">
                SDG {sdg.id}: {sdg.name}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl bg-secondary/50 p-4">
          <p className="text-sm leading-relaxed text-foreground">
            {card.content}
          </p>
        </div>

        <Button className="w-full" size="lg" variant="outline" onClick={onClose}>
          <BookOpen className="h-4 w-4" />
          Done Reading
        </Button>
      </DialogContent>
    </Dialog>
  );
}
