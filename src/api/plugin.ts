import { Elysia } from "elysia";
import { v1 } from "./v1/plugin";

const api = new Elysia({
  prefix: "/api",
}).use(v1);

export { api };
