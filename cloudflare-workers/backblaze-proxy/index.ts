import { AwsClient } from "aws4fetch";

const UNSIGNABLE_HEADERS = [
  "x-forwarded-proto",
  "x-real-ip",
  "accept-encoding",
  "if-match",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "if-unmodified-since",
];

function filterHeaders(headers: Headers, env: any) {
  return new Headers(
    Array.from(headers.entries()).filter(
      (pair) =>
        !(
          UNSIGNABLE_HEADERS.includes(pair[0]) ||
          pair[0].startsWith("cf-") ||
          ("ALLOWED_HEADERS" in env &&
            !env["ALLOWED_HEADERS"].includes(pair[0]))
        ),
    ),
  );
}

export default {
  async fetch(
    request: Request,
    env: {
      S3_ACCESS_KEY: string;
      S3_SECRET: string;
      BUCKET_NAME: string;
      S3_ENDPOINT: string;
    },
  ) {
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      });
    }

    const url = new URL(request.url);

    const { matchId, mapId, file } = Object.fromEntries(url.searchParams);

    const response = await fetch(
      await new AwsClient({
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET,
        service: "s3",
      }).sign(`https://${env.BUCKET_NAME}.${env.S3_ENDPOINT}/${file}`, {
        method: request.method,
        headers: filterHeaders(request.headers, env),
      }),
    );

    return new Response(response.body, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file}"`,
      },
    });
  },
};
