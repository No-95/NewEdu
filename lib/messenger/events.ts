export type OpenMessengerPayload = {
  email: string;
  fullName?: string;
  avatarUrl?: string;
};

export const MESSENGER_OPEN_EVENT = 'hdp:messenger:open';

export function openMessengerWithUser(payload: OpenMessengerPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<OpenMessengerPayload>(MESSENGER_OPEN_EVENT, { detail: payload }));
}
