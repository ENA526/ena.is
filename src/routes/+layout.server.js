export const load = async ({ locals }) => {
  return {
    user: locals.user ?? null,
    session: locals.session ?? null
  };
};
