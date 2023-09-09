import type { Elysia } from "elysia";
import { jwtAccessSetup } from "../routes/auth/setup";
import { prisma } from "../prisma/prisma";

export const isAuthenticated = (app: Elysia) =>
  app
    .use(jwtAccessSetup)
    .derive(async function handler({ jwtAccess, set, request: { headers } }) {
      const authorization = headers.get("authorization");
      if (!authorization) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }
      const token = authorization.split(" ")[1];
      if (!token) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }
      const payload = await jwtAccess.verify(token);
      if (!payload) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }
      const { id } = payload;
      const user = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!user) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }

      return {
        user,
      };
    });
