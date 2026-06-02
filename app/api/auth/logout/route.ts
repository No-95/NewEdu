import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Clear the `user_email` cookie
  res.headers.set('Set-Cookie', 'user_email=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  return res;
}

export async function GET() {
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', 'user_email=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  return res;
}
