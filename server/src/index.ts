import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const main = () => {
  const app = new Hono();
  app.use("/*", cors({ origin: "http://localhost:3000" }));
  app.get("/", (context) => {
    return context.text("Hi there!");
  });
  app.post("/close", (context) => {
    return context.json({});
  });
  app.post("/open", (context) => {
    return context.json({});
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

main();
