import type { Config } from '@netlify/functions';
import serverless from 'serverless-http';

// Import the Express app only during invocation; never start its HTTP/Socket.IO server.
export default async (request: Request) => {
  const { default: app } = await import('../../server/src/app.js');
  const handler = serverless(app);
  const url = new URL(request.url);
  const body = ['GET', 'HEAD'].includes(request.method)
    ? null
    : Buffer.from(await request.arrayBuffer()).toString('base64');
  const result = await handler({
    httpMethod: request.method,
    path: url.pathname,
    headers: Object.fromEntries(request.headers),
    multiValueQueryStringParameters: Object.fromEntries(
      [...new Set(url.searchParams.keys())].map(key => [key, url.searchParams.getAll(key)])
    ),
    queryStringParameters: Object.fromEntries(url.searchParams),
    body,
    isBase64Encoded: body !== null,
    requestContext: { identity: { sourceIp: request.headers.get('x-nf-client-connection-ip') || '127.0.0.1' } },
  }, {}) as { statusCode: number; headers?: Record<string, string>; multiValueHeaders?: Record<string, string[]>; body: string; isBase64Encoded?: boolean };
  const headers = new Headers(result.headers);
  for (const [key, values] of Object.entries(result.multiValueHeaders || {})) {
    headers.delete(key);
    for (const value of values) headers.append(key, value);
  }
  return new Response(request.method === 'HEAD' || [204, 304].includes(result.statusCode)
    ? null
    : result.isBase64Encoded ? Buffer.from(result.body, 'base64') : result.body, {
    status: result.statusCode,
    headers,
  });
};

export const config: Config = { path: ['/api', '/api/*', '/health'] };
