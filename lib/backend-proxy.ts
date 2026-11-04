import { NextRequest, NextResponse } from 'next/server';

export async function proxyToBackend(request: NextRequest, path: string) {
  const base = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const cookie = request.headers.get('cookie');
  if (contentType) headers.set('content-type', contentType);
  if (cookie) headers.set('cookie', cookie);
  const init: RequestInit = { method: request.method, headers, cache: 'no-store' };
  if (!['GET', 'HEAD'].includes(request.method)) init.body = await request.arrayBuffer();

  try {
    const upstream = await fetch(`${base.replace(/\/$/, '')}${path}`, init);
    const responseHeaders = new Headers({
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
    });
    const setCookie = upstream.headers.get('set-cookie');
    if (setCookie) responseHeaders.append('set-cookie', setCookie);
    return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json(
      { detail: 'The Padhaku API is not reachable. Start the backend or configure BACKEND_URL.' },
      { status: 503 },
    );
  }
}
