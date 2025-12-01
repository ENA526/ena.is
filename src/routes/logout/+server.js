// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/auth';

export const GET = async ({ request }) => {
    await auth.api.signOut({ headers: request.headers });
    return redirect(303, '/');
};
