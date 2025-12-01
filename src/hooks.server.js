import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

const DEV = process.env.NODE_ENV === 'development';

/** List protected *exact* paths (add as needed) */
const PROTECTED_PATHS = ['/account'];

/** List protected *prefixes* (everything under these) */
const PROTECTED_PREFIXES = ['/app', '/settings', '/billing'];

/** Admin-only prefixes */
const ADMIN_PREFIXES = ['/admin'];

/** Public-ish prefixes we should ignore (assets, images, etc.) */
const ASSET_PREFIXES = ['/assets', '/images', '/icons', '/font', '/_app'];

/** Is this pathname under any protected rule? */
function isProtectedPath(pathname) {
    if (PROTECTED_PATHS.includes(pathname)) return true;
    return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Is this an admin-only route? */
function isAdminPath(pathname) {
    return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
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

    const path = event.url.pathname;
    const isGET = event.request.method === 'GET';
    const acceptsHTML = event.request.headers.get('accept')?.includes('text/html') ?? false;

    /* ==========================
       DEV AUTH OVERRIDE
       ========================== */

    if (DEV) {
        event.locals.user = {
            id: "8LATq43BBtN9ZhjrNfJmFjJiSVMbCUrZ",
            email: "dev@ena.local",
            name: "Local Developer",
            emailVerified: true,
            image: "https://avatars.githubusercontent.com/u/61644589?v=4&size=64",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            display_name: "Local Dev",
            full_name: "Local Developer",
            bio: "me",
            timezone: "UTC",
            theme: "dark",
            language: "en",

            // ✅ Give yourself admin in dev
            role: "admin"
        };

        event.locals.session = {
            id: "8LATq43BBtN9ZhjrNfJmFjJiSVMbCUrZ",
            userId: "dev-user",
            token: '4480i1pL7Y21MZHyhdn3qE2aVyP2FMdy',
            expiresAt: new Date(Date.now() + 86400000),
            ipAddress: '127.0.0.1',
            userAgent: 'DevServer'
        };

        // Uncomment to simulate logged-out locally:
        // event.locals.user = null;
        // event.locals.session = null;
    }
    else {
        // ✅ Production auth
        const sessionResp = await auth.api.getSession({ headers: event.request.headers });
        event.locals.session = sessionResp?.session ?? null;
        event.locals.user = sessionResp?.user ?? null;
    }

    const isAuthed = Boolean(event.locals.session);

    /* ==========================
       REDIRECT + ACCESS GUARDS
       ========================== */

    if (!DEV && isGET && acceptsHTML && !isAssetPath(path)) {

        /* ---------- ADMIN GUARD ---------- */

        if (isAdminPath(path)) {

            // Not logged in → redirect to login
            if (!isAuthed) {
                const safe = sanitizeRedirect(path + event.url.search, '/');
                throw redirect(303, `/login?redirect=${encodeURIComponent(safe)}`);
            }

            // Logged in, but not admin → forbidden
            if (event.locals.user?.role !== 'admin') {
                throw redirect(303, '/error/403');
            }
        }

        /* ---------- AUTHENTICATED USERS SHOULD NOT HIT LOGIN ---------- */

        if (isAuthed && (path === '/login' || path === '/register')) {
            const requested = sanitizeRedirect(event.url.searchParams.get('redirect'), '/');
            throw redirect(303, requested);
        }

        /* ---------- NOT LOGGED IN ---------- */

        if (!isAuthed) {

            // /logout when not authed → login
            if (path === '/logout') {
                throw redirect(303, '/login?redirect=/');
            }

            // Protected page → redirect to login
            if (isProtectedPath(path)) {
                const full = path + event.url.search;
                const safe = sanitizeRedirect(full, '/');
                const qs = new URLSearchParams({ redirect: safe }).toString();
                throw redirect(303, `/login?${qs}`);
            }
        }
    }

    /* ==========================
       HAND TO BETTER AUTH
       ========================== */

    return svelteKitHandler({ event, resolve, auth, building });
}
