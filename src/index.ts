import { Elysia } from "elysia";
import { api } from "./api/plugin";

const app = new Elysia()
  .use(api)
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
