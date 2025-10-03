import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

/** List protected *exact* paths (add as needed) */
const PROTECTED_PATHS = ['/account'];

/** List protected *prefixes* (everything under these) */
const PROTECTED_PREFIXES = ['/app', '/settings', '/billing'];

/** Public-ish prefixes we should ignore (assets, images, etc.) */
const ASSET_PREFIXES = ['/assets', '/images', '/icons', '/font', '/_app'];

/** Is this pathname under any protected rule? */
function isProtectedPath(pathname) {
  if (PROTECTED_PATHS.includes(pathname)) return true;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Is this clearly an asset/static path? */
function isAssetPath(pathname) {
  return ASSET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Allow only internal redirects and never to /logout */
function sanitizeRedirect(value, fallback = '/') {
  if (!value) return fallback;
  // Only same-origin paths; block absolute/protocol-relative and non-leading-slash
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) return fallback;
  if (!value.startsWith('/')) return fallback;

  // Never send users "back" to logout
  if (value === '/logout' || value.startsWith('/logout/')) return fallback;

  return value;
}

export async function handle({ event, resolve }) {
  // console.log("handle hook called for", event.url.pathname);
  const path = event.url.pathname;
  const isGET = event.request.method === 'GET';
  const acceptsHTML = event.request.headers.get('accept')?.includes('text/html') ?? false;

  // Always resolve Better Auth session and expose on locals
  const sessionResp = await auth.api.getSession({ headers: event.request.headers });
  event.locals.session = sessionResp?.session ?? null;
  event.locals.user = sessionResp?.user ?? null;
  const isAuthed = Boolean(event.locals.session);

  // Only gate HTML page navigations (not assets/api fetches)
  if (isGET && acceptsHTML && !isAssetPath(path)) {
    // Logged-in users shouldn't see /login or /register; honor ?redirect if safe
    if (isAuthed && (path === '/login' || path === '/register')) {
      const requested = sanitizeRedirect(event.url.searchParams.get('redirect'), '/');
      throw redirect(303, requested);
    }

    // Not logged in:
    if (!isAuthed) {
      // /logout when not authed → just go to /login (no redirect back to /logout)
      if (path === '/logout') {
        throw redirect(303, '/login?redirect=/');
      }

      // Protected page without a session → /login?redirect=<safe original>
      if (isProtectedPath(path)) {
        const full = path + event.url.search; // preserve original query
        const safe = sanitizeRedirect(full, '/');
        const qs = new URLSearchParams({ redirect: safe }).toString();
        throw redirect(303, `/login?${qs}`);
      }
      // else: public page → let through
    }
  }

  // Hand off to Better Auth / SvelteKit normally
  return svelteKitHandler({ event, resolve, auth, building });
}
