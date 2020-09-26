import { Application, Router } from "https://deno.land/x/oak@v6.2.0/mod.ts";

const app = new Application();
const controller = new AbortController();

const router = new Router();
router
  .get("/", (ctx) => {
    ctx.response.body = "Hello World from oak.ts!";
  })
  .get("/crash", (ctx) => {
    ctx.response.body = "Crashing from oak.ts!";
    controller.abort();
  });

app.use(router.routes());
app.use(router.allowedMethods());

const { signal } = controller;
console.log("Listening to :8000");
await app.listen({ port: 8000, signal });
