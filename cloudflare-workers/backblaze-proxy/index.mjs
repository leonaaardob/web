import { AwsClient } from 'aws4fetch';

const UNSIGNABLE_HEADERS = [
  'x-forwarded-proto',
  'x-real-ip',
  'accept-encoding',
  'if-match',
  'if-modified-since',
  'if-none-match',
  'if-range',
  'if-unmodified-since',
];

function filterHeaders(headers, env) {
  return new Headers(
    Array.from(headers.entries())
      .filter(pair => !(
        UNSIGNABLE_HEADERS.includes(pair[0]) ||
        pair[0].startsWith('cf-') ||
        ('ALLOWED_HEADERS' in env && !env['ALLOWED_HEADERS'].includes(pair[0]))
      ))
  );
}

export default {
  async fetch(request, env) {
    const { S3_ACCESS_KEY, S3_SECRET, BUCKET_NAME, S3_ENDPOINT } = env;

    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response(null, { 
        status: 405, 
        statusText: "Method Not Allowed" 
      });
    }

    const url = new URL(request.url);

    url.protocol = env.S3_HTTP_PROTOCOL || "https:";
    url.port = env.S3_HTTP_PORT || "443";

    let path = url.pathname.replace(/^\//, '');
    path = path.replace(/\/$/, '');

    if(path === '') {
       return new Response(null, { 
        status: 405, 
        statusText: "Method Not Allowed" 
      });
    }

    url.hostname = `${BUCKET_NAME}.${S3_ENDPOINT}`;

    return await fetch(await new AwsClient({
      "accessKeyId": S3_ACCESS_KEY,
      "secretAccessKey": S3_SECRET,
      "service": "s3",
    }).sign(url.toString(), {
      method: request.method,
      headers: filterHeaders(request.headers, env)
    }));
  },
}; 