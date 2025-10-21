// Stub notification service. Replace with real SMS/Email integrations.
export async function notifyUser(userId, payload) {
  // eslint-disable-next-line no-console
  console.log('[notifyUser]', { userId, payload });
  return { ok: true };
}
