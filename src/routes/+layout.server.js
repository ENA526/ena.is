export const load = async ({ locals, depends, url }) => {
  url.pathname // trigger a reload when the path changes
  return {
    user: locals.user ?? null,
    session: locals.session ?? null
  }
}
