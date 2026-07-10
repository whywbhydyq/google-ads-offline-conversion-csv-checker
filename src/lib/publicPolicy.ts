export const ADSENSE_ALLOWED_PATHS = new Set(['/']);

export function isAdsenseAllowedPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return ADSENSE_ALLOWED_PATHS.has(normalized);
}
