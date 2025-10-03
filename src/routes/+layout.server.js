export const load = async ({ locals, url }) => {
  // Force this load to depend on the current path so it re-runs on every nav
  url.pathname;

  console.log("Layout load function called for", url.pathname);

  return {
    user: locals.user ?? null,
    session: locals.session ?? null
  };
};
