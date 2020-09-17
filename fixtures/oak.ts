import { Application } from "https://deno.land/x/oak@v6.2.0/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

console.log("Listening to :8080");
await app.listen({ port: 8000 });
