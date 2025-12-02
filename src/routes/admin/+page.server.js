import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/auth';

export async function load({ locals, request }) {
    // Check if user is logged in
    if (!locals.user) {
        throw redirect(303, '/login');
    }
    
    // Get linked accounts
    const accounts = await auth.api.listAccounts({
        headers: request.headers
    });
    
    // Log to console (server-side)
    console.log('Linked accounts:', accounts);
    
    return {
        accounts: accounts || []
    };
}