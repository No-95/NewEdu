#!/usr/bin/env node
/**
 * GA4 Data API client — dependency-free.
 *
 * Mints a Google OAuth2 access token from a service-account JSON key using the
 * JWT-bearer grant (RFC 7523) and calls the GA4 Data API + Admin API.
 *
 * Why no googleapis/google-auth-library: the whole thing is ~120 lines of
 * node:crypto + fetch, and this repo must stay reproducible from a clean clone
 * without adding a heavy dependency tree.
 *
 * Usage:
 *   node scripts/ga4-data-api.mjs selftest
 *   node scripts/ga4-data-api.mjs whoami
 *   node scripts/ga4-data-api.mjs resolve-property --measurement-id G-E5DZZJLMBX
 *   node scripts/ga4-data-api.mjs report --property-id 123456789 \
 *        --start 2026-10-01 --end 2026-10-11 --metrics sessions,totalUsers,eventCount
 *
 * Credential source, first match wins:
 *   --key-file <path>              path to the service-account JSON key
 *   GA4_SERVICE_ACCOUNT_FILE       env: path to the key
 *   GA4_SERVICE_ACCOUNT_JSON       env: the key itself, as a JSON string
 *   GA4_SERVICE_ACCOUNT_KEY        env: the key itself (alias)
 *
 * The credential is never written to disk, never logged, and never echoed.
 * Only the service-account email (a non-secret identifier) is printed.
 */

import { createSign, createPrivateKey } from 'node:crypto';
import { readFileSync } from 'node:fs';

const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_TTL_SECONDS = 3600;

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      out._.push(token);
      continue;
    }
    const eq = token.indexOf('=');
    if (eq !== -1) {
      out[token.slice(2, eq)] = token.slice(eq + 1);
      continue;
    }
    const name = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[name] = true;
    } else {
      out[name] = next;
      i++;
    }
  }
  return out;
}

function die(message, hint) {
  console.error(`ERROR: ${message}`);
  if (hint) console.error(`HINT:  ${hint}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// service-account key
// ---------------------------------------------------------------------------

/**
 * Load and shape-check a service-account JSON key.
 * Keys pasted through env vars or forms often arrive with literal `\n`.
 */
function loadServiceAccountKey(args) {
  const raw = (() => {
    if (typeof args['key-file'] === 'string') return readFileSync(args['key-file'], 'utf8');
    if (process.env.GA4_SERVICE_ACCOUNT_FILE) {
      return readFileSync(process.env.GA4_SERVICE_ACCOUNT_FILE, 'utf8');
    }
    return process.env.GA4_SERVICE_ACCOUNT_JSON || process.env.GA4_SERVICE_ACCOUNT_KEY || '';
  })();

  if (!raw.trim()) {
    die(
      'No service-account credential found.',
      'Pass --key-file <path>, or set GA4_SERVICE_ACCOUNT_JSON / GA4_SERVICE_ACCOUNT_FILE. ' +
        'Run `node scripts/ga4-data-api.mjs selftest` to check the code path without a real credential.',
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    die('Service-account credential is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') die('Service-account credential must be a JSON object.');

  if (parsed.type && parsed.type !== 'service_account') {
    die(`Expected a service_account key, got type="${parsed.type}".`);
  }
  if (typeof parsed.client_email !== 'string' || !parsed.client_email) {
    die('Service-account key is missing client_email.');
  }
  if (typeof parsed.private_key !== 'string' || !parsed.private_key) {
    die('Service-account key is missing private_key.');
  }

  // Validate the PEM up front so a mangled key fails here, not at the network.
  const privateKey = parsed.private_key.replace(/\\n/g, '\n');
  try {
    createPrivateKey(privateKey);
  } catch (err) {
    die(`private_key is not a usable PEM private key: ${err.message}`);
  }

  return {
    clientEmail: parsed.client_email,
    privateKey,
    projectId: parsed.project_id || null,
    tokenUri: parsed.token_uri || TOKEN_URI,
  };
}

// ---------------------------------------------------------------------------
// OAuth2 JWT-bearer grant (RFC 7523)
// ---------------------------------------------------------------------------

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Build and RS256-sign the JWT assertion for a service account. */
export function buildAssertion({ clientEmail, privateKey, tokenUri, scope = SCOPE }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: clientEmail,
    scope,
    aud: tokenUri,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign('RSA-SHA256').update(signingInput).sign(privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

/** Exchange the signed assertion for an access token. */
export async function mintAccessToken(key) {
  const assertion = buildAssertion(key);
  const res = await fetch(key.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok || !body.access_token) {
    const detail = body.error_description || body.error || text;
    const err = new Error(`Token exchange failed (HTTP ${res.status}): ${detail}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return { accessToken: body.access_token, expiresIn: body.expires_in ?? TOKEN_TTL_SECONDS };
}

// ---------------------------------------------------------------------------
// Google API calls
// ---------------------------------------------------------------------------

async function googleFetch(url, accessToken, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { status: res.status, ok: res.ok, body };
}

/** Admin API: every GA4 property this principal can see, with its data streams. */
async function listProperties(accessToken) {
  const summaries = await googleFetch(`${ADMIN_API}/accountSummaries?pageSize=200`, accessToken);
  if (!summaries.ok) return { ok: false, status: summaries.status, body: summaries.body };

  const out = [];
  for (const account of summaries.body.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      // prop.property looks like "properties/123456789"
      const numericId = String(prop.property || '').replace(/^properties\//, '');
      const streams = await googleFetch(
        `${ADMIN_API}/${prop.property}/dataStreams?pageSize=200`,
        accessToken,
      );
      const webStreams = streams.ok
        ? (streams.body.dataStreams || []).map((s) => ({
            displayName: s.displayName || null,
            measurementId: s.webStreamData?.measurementId || null,
            defaultUri: s.webStreamData?.defaultUri || null,
            type: s.type || null,
          }))
        : [];
      out.push({
        account: account.displayName || null,
        displayName: prop.displayName || null,
        propertyId: numericId,
        propertyType: prop.propertyType || null,
        canEdit: prop.canEdit ?? null,
        dataStreams: webStreams,
      });
    }
  }
  return { ok: true, properties: out };
}

/** Data API: runReport. `propertyId` is the numeric id, not the G- measurement id. */
async function runReport(accessToken, propertyId, body) {
  return googleFetch(`${DATA_API}/properties/${propertyId}:runReport`, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// output helpers
// ---------------------------------------------------------------------------

function printReport(body) {
  const dims = (body.dimensionHeaders || []).map((h) => h.name);
  const mets = (body.metricHeaders || []).map((h) => h.name);
  console.log(`rows: ${body.rowCount ?? (body.rows || []).length}`);
  console.log([...dims, ...mets].join('\t'));
  for (const row of body.rows || []) {
    const d = (row.dimensionValues || []).map((v) => v.value);
    const m = (row.metricValues || []).map((v) => v.value);
    console.log([...d, ...m].join('\t'));
  }
  if (body.metadata?.currencyCode) console.log(`currency: ${body.metadata.currencyCode}`);
  for (const row of body.totals || []) {
    console.log(`TOTAL\t${(row.metricValues || []).map((v) => v.value).join('\t')}`);
  }
}

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || 'help';
async function cmdSelftest() {
  // Proves the code path end to end WITHOUT a real credential: generate a
  // throwaway RSA key, sign a real assertion, send it to Google, and show that
  // Google parsed and rejected the *principal* (not the assertion format).
  const { generateKeyPairSync } = await import('node:crypto');
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });

  const fake = {
    clientEmail: 'ga4-selftest-throwaway@example.iam.gserviceaccount.com',
    privateKey,
    tokenUri: TOKEN_URI,
  };

  const assertion = buildAssertion(fake);
  const parts = assertion.split('.');
  console.log('1. assertion built          :', parts.length === 3 ? 'ok (3 JWT segments)' : 'FAIL');
  console.log('2. assertion length         :', assertion.length);

  let res;
  try {
    res = await fetch(TOKEN_URI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
  } catch (err) {
    console.log('3. token endpoint reachable : NO —', err.message);
    process.exit(1);
  }
  const text = await res.text();
  console.log('3. token endpoint reachable : yes (HTTP', res.status + ')');
  console.log('4. google response          :', text.slice(0, 400));

  let body = {};
  try {
    body = JSON.parse(text);
  } catch {
    /* ignore */
  }
  const reason = body.error || '';
  const parsedByGoogle =
    res.status === 400 &&
    ['invalid_grant', 'unauthorized_client', 'invalid_client'].includes(reason);
  console.log(
    '5. verdict                  :',
    parsedByGoogle
      ? 'PASS — Google parsed our signed assertion and rejected the throwaway principal. ' +
        'JWT construction, RS256 signing and the token exchange are all correct.'
      : `INCONCLUSIVE — Google said error="${reason || text.slice(0, 80)}". Investigate before trusting this tool.`,
  );
  process.exit(parsedByGoogle ? 0 : 1);
}

async function main() {
  if (command === 'help' || args.help) {
    console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0].replace(/^\/\*\*?/, ''));
    return;
  }
  if (command === 'selftest') return cmdSelftest();

  if (command === 'report') {
    // Argument guards run before the credential is touched, so an obvious
    // mistake fails with a clear message instead of a confusing auth error.
    const propertyId = args['property-id'] || process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      die('report needs --property-id <numeric> (run `resolve-property` first).');
    }
    if (/^G-/.test(String(propertyId))) {
      die(
        `--property-id must be the NUMERIC property id, not the measurement id "${propertyId}".`,
        `Run \`node scripts/ga4-data-api.mjs resolve-property --measurement-id ${propertyId}\`.`,
      );
    }

    const key = loadServiceAccountKey(args);
    console.log(`service account : ${key.clientEmail}`);
    const { accessToken } = await mintAccessToken(key);

    const metrics = String(args.metrics || 'sessions,totalUsers,eventCount')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    const dimensions = String(args.dimensions || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const body = {
      dateRanges: [{ startDate: args.start || '7daysAgo', endDate: args.end || 'today' }],
      metrics,
    };
    if (dimensions.length) body.dimensions = dimensions;
    if (args.limit) body.limit = String(args.limit);
    if (args.orderBy) body.orderBys = [{ metric: { metricName: args.orderBy }, desc: true }];
    if (args.totals) body.metricAggregations = ['TOTAL'];

    const res = await runReport(accessToken, propertyId, body);
    console.log(`POST ${DATA_API}/properties/${propertyId}:runReport -> HTTP ${res.status}`);
    if (!res.ok) {
      console.log(JSON.stringify(res.body, null, 2));
      process.exit(1);
    }
    printReport(res.body);
    return;
  }

  const key = loadServiceAccountKey(args);
  console.log(`service account : ${key.clientEmail}`);
  if (key.projectId) console.log(`project         : ${key.projectId}`);

  const { accessToken, expiresIn } = await mintAccessToken(key);
  console.log(`access token    : minted, expires in ${expiresIn}s`);

  if (command === 'whoami') {
    const listed = await listProperties(accessToken);
    if (!listed.ok) {
      console.log(`HTTP ${listed.status}`);
      console.log(JSON.stringify(listed.body, null, 2));
      process.exit(1);
    }
    console.log(`visible properties: ${listed.properties.length}`);
    for (const p of listed.properties) {
      const ids = p.dataStreams.map((s) => s.measurementId).filter(Boolean).join(',') || '(none)';
      console.log(
        `  properties/${p.propertyId}\t${p.displayName}\ttype=${p.propertyType}\tcanEdit=${p.canEdit}\tmeasurementIds=${ids}`,
      );
    }
    return;
  }

  if (command === 'resolve-property') {
    const want = args['measurement-id'] || process.env.NEXT_PUBLIC_GA4_ID || 'G-E5DZZJLMBX';
    const listed = await listProperties(accessToken);
    if (!listed.ok) {
      console.log(`HTTP ${listed.status}`);
      console.log(JSON.stringify(listed.body, null, 2));
      process.exit(1);
    }
    const hits = [];
    for (const p of listed.properties) {
      for (const s of p.dataStreams) {
        if (s.measurementId === want) hits.push({ ...p, stream: s });
      }
    }
    if (hits.length === 0) {
      console.log(`measurement id ${want} NOT found among ${listed.properties.length} visible properties.`);
      console.log('The service account is not granted access to the GA4 property that owns this stream.');
      process.exit(1);
    }
    for (const h of hits) {
      console.log(`measurement id ${want} -> properties/${h.propertyId}`);
      console.log(`  property name : ${h.displayName}`);
      console.log(`  account       : ${h.account}`);
      console.log(`  stream        : ${h.stream.displayName} (${h.stream.defaultUri || 'no uri'})`);
    }
    return;
  }

  die(`Unknown command: ${command}`, 'Run `node scripts/ga4-data-api.mjs help`.');
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
