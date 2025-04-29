import { Zip, ZipDeflate } from "fflate";
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

async function getDemo(zip: Zip, request: Request, demo: string, env: any) {
  console.info(`getting demo: ${demo}`);

  const demoendpoint = `https://${env.BUCKET_NAME}.${env.S3_ENDPOINT}/${demo}`;

  try {
    const fileName = demo.split("/").at(-1) || "";
    const zipEntry = new ZipDeflate(fileName, {
      level: 0,
    });

    zip.add(zipEntry);

    const response = await fetch(
      await new AwsClient({
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET,
        service: "s3",
      }).sign(demoendpoint, {
        method: request.method,
        headers: filterHeaders(request.headers, env),
      }),
    );

    if (!response?.body) {
      throw new Error(`Failed to fetch demo`);
    }

    const reader = response.body.getReader();

    return new Promise((resolve, reject) => {
      function pump(): Promise<void> {
        return reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              console.info(`finished processing demo: ${fileName}`);
              zipEntry.push(new Uint8Array(0), true);
              resolve(true);
              return;
            }

            zipEntry.push(value, false);
            return pump();
          })
          .catch((err) => {
            console.error(`error processing demo: ${err.message}`);
            reject(err);
          });
      }

      pump();
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`error in getdemo: ${error.message}`);
    } else {
      console.error(`error in getdemo: ${String(error)}`);
    }
    throw error;
  }
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

    const { matchId, mapId, files } = Object.fromEntries(url.searchParams);

    if (!matchId || !mapId || !files) {
      return new Response(null, {
        status: 400,
        statusText: "Bad Request",
      });
    }

    const zip = new Zip();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    zip.ondata = (err, data) => {
      if (err) {
        console.warn(`zip error: ${err}`);
        return;
      }
      if (data) {
        writer.write(data).catch((err) => {
          console.error("error writing to stream:", err);
        });
      }
    };

    const fileList = files.split(",");

    // Start processing demos in the background
    Promise.all(fileList.map((file) => getDemo(zip, request, file, env)))
      .then(() => {
        zip.end();
        writer.close();
      })
      .catch((error) => {
        if (error instanceof Error) {
          console.error(
            `error processing demos: ${error.message}`,
            error.stack,
          );
        } else {
          console.error(`error processing demos: ${String(error)}`);
        }
        writer.abort(error);
      });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${matchId}-${mapId}-demos.zip"`,
      },
    });
  },
};
