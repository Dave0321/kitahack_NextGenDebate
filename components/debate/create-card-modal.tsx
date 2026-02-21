"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SDG_GOALS } from "@/lib/data/sdg-data";
import type { DebateCardData } from "@/lib/models/debate-card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CreateCardModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (card: DebateCardData) => void;
  defaultCategory: "trending" | "continue" | "recommended";
}

export function CreateCardModal({
  open,
  onClose,
  onSubmit,
  defaultCategory,
}: CreateCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    const hasContent = title.trim() || videoUrl.trim() || file;
    if (!hasContent || !description.trim() || selectedSdgs.length === 0)
      return;

    const finalTitle = title.trim()
      ? title.trim()
      : file
        ? file.name.split('.')[0]
        : videoUrl.trim()
          ? "Video Challenge"
          : "New Challenge";

    const newCard: DebateCardData = {
      id: `debate-${Date.now()}`,
      title: finalTitle,
      description: description.trim(),
      videoUrl: videoUrl.trim() || undefined,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      fileName: file ? file.name : undefined,
      fileType: file ? (file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'mp4') : undefined,
      sdgTags: selectedSdgs,
      category: defaultCategory,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onSubmit(newCard);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setFile(null);
    setSelectedSdgs([]);
    onClose();
  };

  const hasContent = title.trim().length > 0 || videoUrl.trim().length > 0 || file !== null;
  const isValid = hasContent && description.trim().length > 0 && selectedSdgs.length > 0;

  const toggleSdg = (id: number) => {
    setSelectedSdgs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Debate Topic</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new debate card.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Topic Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="topic-name">Topic Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="topic-name"
              placeholder="Enter the debate topic name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="topic-description">Description</Label>
            <Textarea
              id="topic-description"
              placeholder="Describe the debate topic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Main Content Options */}
          <div className="flex flex-col gap-3 rounded-lg border border-border p-3 bg-secondary/10">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Content Provider (Provide at least one)</Label>

            {/* YouTube Video Link */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="video-url" className="text-sm">
                YouTube Video Link
              </Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px w-full bg-border" />
              <span className="text-xs text-muted-foreground font-medium uppercase">OR</span>
              <div className="h-px w-full bg-border" />
            </div>

            {/* File Upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="file-upload" className="text-sm">
                Upload File <span className="text-muted-foreground font-normal">(MP4 or PDF)</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".mp4,.pdf"
                className="cursor-pointer file:cursor-pointer file:bg-primary/20 file:text-primary file:border-0 file:rounded-md file:mr-3 hover:file:bg-primary/30"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  } else {
                    setFile(null);
                  }
                }}
              />
            </div>
          </div>

          {/* SDG Tags */}
          <div className="flex flex-col gap-2">
            <Label>
              SDG Categories{" "}
              <span className="text-muted-foreground font-normal">
                (select up to 2)
              </span>
            </Label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto rounded-lg border p-2">
              {SDG_GOALS.map((sdg) => {
                const isSelected = selectedSdgs.includes(sdg.id);
                const isDisabled = !isSelected && selectedSdgs.length >= 2;
                return (
                  <button
                    key={sdg.id}
                    onClick={() => !isDisabled && toggleSdg(sdg.id)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-all",
                      isSelected
                        ? "text-white ring-2 ring-offset-1"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      isDisabled && "opacity-40 cursor-not-allowed"
                    )}
                    style={
                      isSelected
                        ? {
                          backgroundColor: sdg.color,
                        }
                        : undefined
                    }
                  >
                    {isSelected && <Check className="h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">
                      {sdg.id}. {sdg.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Create Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
