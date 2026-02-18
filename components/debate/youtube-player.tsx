"use client";

import { useState } from "react";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/utils/youtube";
import { Play } from "lucide-react";

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export function YouTubePlayer({ url, title = "Video", className = "" }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(url);
  const thumbnail = getYouTubeThumbnail(url, "high");

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline break-all"
      >
        {url}
      </a>
    );
  }

  if (!isPlaying && thumbnail) {
    return (
      <button
        onClick={() => setIsPlaying(true)}
        className={`group relative w-full overflow-hidden rounded-xl bg-secondary ${className}`}
        aria-label={`Play ${title}`}
      >
        <div className="aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={`Thumbnail for ${title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg transition-transform group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 text-primary-foreground" fill="currentColor" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          src={`${embedUrl}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
