export interface YouTubeMetadata {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  durationSeconds: number | null;
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts an 11-character YouTube video ID from standard watch, short,
 * embed, live, or Shorts URLs.
 */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtu.be") {
      const candidate = parsed.pathname.split("/").filter(Boolean)[0];
      return candidate && YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      const watchId = parsed.searchParams.get("v");
      if (watchId && YOUTUBE_ID_REGEX.test(watchId)) {
        return watchId;
      }

      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const prefix = pathSegments[0];
      const candidate = pathSegments[1];
      if (
        (prefix === "embed" ||
          prefix === "shorts" ||
          prefix === "live" ||
          prefix === "v") &&
        candidate &&
        YOUTUBE_ID_REGEX.test(candidate)
      ) {
        return candidate;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Fetches public metadata for a YouTube video using YouTube's oEmbed endpoint
 * with a clean fallback if offline or rate-limited.
 */
export async function fetchYouTubeMetadata(
  urlOrVideoId: string
): Promise<YouTubeMetadata> {
  const videoId = extractYouTubeId(urlOrVideoId);
  const canonicalUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : urlOrVideoId;

  const fallback: YouTubeMetadata = {
    videoId: videoId ?? "dQw4w9WgXcQ",
    title: "Untitled Video Action Kit",
    channelName: "YouTube Creator",
    thumbnailUrl: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : "",
    durationSeconds: null,
  };

  if (!videoId) {
    return fallback;
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      canonicalUrl
    )}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };

    return {
      videoId,
      title: data.title?.trim() || fallback.title,
      channelName: data.author_name?.trim() || fallback.channelName,
      thumbnailUrl: data.thumbnail_url || fallback.thumbnailUrl,
      durationSeconds: null,
    };
  } catch {
    return fallback;
  }
}

/**
 * Formats seconds into MM:SS or HH:MM:SS for clickable video timestamps.
 */
export function formatTimestamp(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Generates an SEO-friendly unique slug from a kit title.
 */
export function slugifyTitle(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");

  const safeBase = base || "action-kit";
  const uniqueSuffix =
    suffix ?? Math.random().toString(36).substring(2, 8);

  return `${safeBase}-${uniqueSuffix}`;
}
