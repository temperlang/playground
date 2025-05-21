import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import PQueue from "p-queue";
import { type BuildRequest, Watch } from "./watch.js";
import { share } from "./share.js";

const main = async () => {
  const queue = new PQueue({ concurrency: 1 });
  const watch = new Watch();
  await watch.start();
  process.on("exit", () => {
    // This doesn't seem to work, but it feels right to try.
    watch.stop();
  });
  const app = new Hono();
  app.use("/*", cors({ origin: "*" }));
  app.get("/", async (context) => {
    return context.text("Running. Post for actual processing.");
  });
  app.post("/build", async (context) => {
    const request = (await context.req.json()) as BuildRequest;
    validate(request);
    const response = (await queue.add(async () => {
      return await watch.build(request);
    }))!;
    return context.json(response);
  });
  app.post("/share", async (context) => {
    const request = (await context.req.json()) as BuildRequest;
    validate(request);
    const response = await share(request);
    return context.json(response);
  });
  serve(
    {
      fetch: app.fetch,
      port: 3001,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
};

const validate = (request: BuildRequest) => {
  // Apply some arbitrary but fairly large limit for a playground.
  // Our only problems could be DoS/scale or some compiler or jvm bug.
  // Max length is one small way to help keep scale down.
  // TODO Use ArkType for validation and hono-openapi?
  const limit = 1 << 15;
  if (request.source.length > limit) {
    throw new Error(`Source length: ${request.source.length} > ${limit}`);
  }
};

await main();
