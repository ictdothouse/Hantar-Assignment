/**
 * Utilities to generate and handle website thumbnails
 */

export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

export function isValidUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const url = new URL(normalizeUrl(rawUrl));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generates an automated thumbnail URL for a given website URL.
 * Uses WordPress mshots service which is free, fast, and does not require an API key.
 */
export function generateThumbnailUrl(websiteUrl: string): string {
  const clean = normalizeUrl(websiteUrl);
  if (!clean || !isValidUrl(clean)) {
    return '';
  }
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(clean)}?w=800&h=500`;
}

/**
 * Returns a fallback thumbnail image URL using a nice patterned visual
 * with the site's hostname if WordPress mshots fails or takes time.
 */
export function getFallbackThumbnailUrl(title: string, hostname?: string): string {
  const seed = encodeURIComponent(title || hostname || 'Web Project');
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=0f172a,1e293b,0369a1,4338ca`;
}

export function extractHostname(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
