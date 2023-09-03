import Elysia from "elysia";
import { auth } from "./auth/plugin";

const v1 = new Elysia({
  prefix: "/v1",
}).use(auth)

export {
  v1,
}
