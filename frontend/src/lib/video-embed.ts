export type VideoProvider = "youtube" | "vimeo";

export type ParsedVideo = {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  watchUrl: string;
};

/**
 * Parse a public YouTube or Vimeo URL into something we can embed.
 * Returns null for unsupported providers / unparseable URLs.
 *
 * Supported shapes:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - https://vimeo.com/ID
 *   - https://player.vimeo.com/video/ID
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? makeYouTube(id) : null;
    }
    const m = url.pathname.match(/^\/(?:embed|shorts|v)\/([a-zA-Z0-9_-]{6,})/);
    if (m) return makeYouTube(m[1]);
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? makeYouTube(id) : null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    if (id && /^\d+$/.test(id)) return makeVimeo(id);
  }

  if (host === "player.vimeo.com") {
    const m = url.pathname.match(/\/video\/(\d+)/);
    if (m) return makeVimeo(m[1]);
  }

  return null;
}

function makeYouTube(id: string): ParsedVideo {
  return {
    provider: "youtube",
    videoId: id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

function makeVimeo(id: string): ParsedVideo {
  return {
    provider: "vimeo",
    videoId: id,
    embedUrl: `https://player.vimeo.com/video/${id}`,
    // Vimeo thumbnails require an oEmbed lookup; skip in MVP and let the iframe load directly.
    thumbnailUrl: null,
    watchUrl: `https://vimeo.com/${id}`,
  };
}
