/**
 * Normalizes and resolves product/avatar image URLs.
 * If an image was saved with http://localhost:5000 in development,
 * in production this automatically rewrites it to use the live VITE_API_URL backend host.
 */
export function formatImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '';
  }

  // If URL was stored with localhost:5000 or 127.0.0.1:5000 in database
  if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    // Extract base backend origin (e.g. https://your-backend.onrender.com)
    const backendOrigin = rawApiUrl.replace(/(?:\/api)?(?:\/v1)?\/?$/, '');
    if (backendOrigin && !backendOrigin.includes('localhost')) {
      return url.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5000/, backendOrigin);
    }
  }

  return url;
}
