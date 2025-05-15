import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import PQueue from "p-queue";
import { type BuildRequest, Watch } from "./watch.ts";

const main = async () => {
  const queue = new PQueue({ concurrency: 1 });
  const watch = new Watch();
  await watch.start();
  process.on("exit", () => {
    // This doesn't seem to work, but it feels right to try.
    watch.stop();
  });
  const app = new Hono();
  app.use("/*", cors({ origin: "http://localhost:3000" }));
  app.get("/", async (context) => {
    return context.text("Running. Post for actual processing.");
  });
  app.post("/", async (context) => {
    const request = (await context.req.json()) as BuildRequest;
    // TODO Queue actual code building.
    const text = (await queue.add(async () => {
      return await watch.build(request);
    })) as string;
    return context.text(text);
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

await main();
