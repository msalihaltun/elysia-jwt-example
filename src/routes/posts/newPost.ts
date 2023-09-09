import { Elysia } from "elysia";
import { postModel } from "./setup";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { prisma } from "../../prisma/prisma";

export const newPost = new Elysia({
  prefix: "/posts",
})
  .use(postModel)
  .use(isAuthenticated)
  .post(
    "/",
    async function handler({ body, set, user }) {
      const { content } = body;
      if (content.length === 0) {
        set.status = 400;
        return {
          message: "Content cannot be empty.",
        };
      }
      const post = await prisma.post.create({
        data: {
          content,
          authorId: user!.id,
        },
      })
    },
    {
      body: "postModel",
    }
  );
