
import { Elysia, t} from "elysia";

export const postModel = new Elysia().model({
  postModel: t.Object({
    content: t.String(),
  }),
});
