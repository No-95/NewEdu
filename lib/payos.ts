import { PayOS } from '@payos/node';

export function getPayosCredentials() {
  const clientId = (process.env.PAYOS_CLIENT_ID || '').trim();
  const apiKey = (process.env.PAYOS_API_KEY || '').trim();
  const checksumKey = (process.env.PAYOS_CHECKSUM_KEY || '').trim();
  return { clientId, apiKey, checksumKey };
}

export function isPayosConfigured(): boolean {
  const { clientId, apiKey, checksumKey } = getPayosCredentials();
  return Boolean(clientId && apiKey && checksumKey);
}

export function getPayosClient(): PayOS | null {
  if (!isPayosConfigured()) return null;
  const { clientId, apiKey, checksumKey } = getPayosCredentials();
  return new PayOS({ clientId, apiKey, checksumKey });
}

export function getAppBaseUrl(request?: Request): string {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  if (request) {
    const origin = new URL(request.url).origin;
    if (origin) return origin;
  }
  return 'http://localhost:3000';
}

export function buildPayosOrderCode(): number {
  const base = Date.now() % 1_000_000_000;
  const jitter = Math.floor(Math.random() * 1000);
  return base * 1000 + jitter;
}
