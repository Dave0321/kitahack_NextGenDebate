/**
 * Utility to extract YouTube video IDs and generate embed URLs.
 * Supports standard, short, and embed YouTube URL formats.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(videoIdOrUrl: string): string | null {
  // If it's already just an ID (11 chars, no slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(videoIdOrUrl)) {
    return `https://www.youtube.com/embed/${videoIdOrUrl}`;
  }

  const id = extractYouTubeId(videoIdOrUrl);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function getYouTubeThumbnail(
  videoIdOrUrl: string,
  quality: "default" | "medium" | "high" | "maxres" = "high"
): string | null {
  let id = videoIdOrUrl;
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    const extracted = extractYouTubeId(videoIdOrUrl);
    if (!extracted) return null;
    id = extracted;
  }

  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    maxres: "maxresdefault",
  };

  return `https://img.youtube.com/vi/${id}/${qualityMap[quality]}.jpg`;
}
