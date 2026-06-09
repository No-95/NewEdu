export async function resolvePostAuthPath(): Promise<string> {
  const response = await fetch('/api/onboarding/status', { cache: 'no-store' });

  if (response.status === 401) {
    return '/auth';
  }

  if (!response.ok) {
    return '/dashboard';
  }

  const status = (await response.json()) as { required?: boolean; completed?: boolean };

  if (status.required && !status.completed) {
    return '/onboarding';
  }

  return '/dashboard';
}
