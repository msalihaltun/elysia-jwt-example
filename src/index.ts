import { Elysia } from "elysia";
import { auth } from "./routes/auth/plugin";
import { posts } from "./routes/posts/plugin";

const app = new Elysia()
  .use(auth)
  .use(posts)
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
