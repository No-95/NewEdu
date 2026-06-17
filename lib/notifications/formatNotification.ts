type NotificationItem = {
  type: string;
  title: string;
  body: string;
  params?: Record<string, string> | null;
};

function interpolate(template: string, params: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? `{${key}}`);
}

export function formatNotificationText(
  item: NotificationItem,
  t: (key: string) => string
): { title: string; body: string } {
  const params = item.params ?? {};
  const titleKey = `notifications.types.${item.type}.title`;
  const bodyKey = `notifications.types.${item.type}.body`;
  const translatedTitle = t(titleKey);
  const translatedBody = t(bodyKey);

  if (translatedTitle !== titleKey) {
    return {
      title: interpolate(translatedTitle, params),
      body: translatedBody !== bodyKey ? interpolate(translatedBody, params) : item.body,
    };
  }

  return { title: item.title, body: item.body };
}
