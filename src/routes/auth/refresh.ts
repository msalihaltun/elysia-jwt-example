import cookie from "@elysiajs/cookie";
import { Elysia } from "elysia";
import { jwtAccessSetup, jwtRefreshSetup } from "./setup";
import { prisma } from "../../prisma/prisma";
import { randomUUID } from "crypto";

export const refresh = new Elysia()
  .use(cookie())
  .use(jwtRefreshSetup)
  .use(jwtAccessSetup)
  .post(
    "/refresh",
    async function handler({
      set,
      jwtRefresh,
      jwtAccess,
      setCookie,
      cookie: { refresh_token: refreshToken },
    }) {
      const payload = await jwtRefresh.verify(refreshToken);
      if (!payload) {
        set.status = 401;
        return {
          message: "Unauthorized.",
        };
      }
      const { id } = payload;
      const existingToken = await prisma.refreshToken.findUnique({
        where: {
          id,
        },
      });

      if (!existingToken) {
        set.status = 401;
        return {
          message: "Unauthorized.",
        };
      }
      const hashedToken = new Bun.CryptoHasher("sha512")
        .update(refreshToken!)
        .digest("hex");
      if (hashedToken !== existingToken.hashedToken) {
        set.status = 401;
        return {
          message: "Unauthorized.",
        };
      }

      const user = await prisma.user.findUnique({
        where: {
          id: existingToken.userId,
        },
      });
      if (!user) {
        set.status = 401;
        return {
          message: "Unauthorized.",
        };
      }

      await prisma.refreshToken.delete({
        where: {
          id,
        },
      });

      // wait
      const refreshId = randomUUID();
      const newRefreshToken = await jwtRefresh.sign({
        id: refreshId,
      });
      const hashedRefreshToken = new Bun.CryptoHasher("sha512")
        .update(newRefreshToken)
        .digest("hex");

      await prisma.refreshToken.create({
        data: {
          hashedToken: hashedRefreshToken,
          id: refreshId,
          userId: user.id,
        },
      });

      const accessToken = await jwtAccess.sign({
        id: String(user.id),
      });
      setCookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 86400,
      });
      return {
        accessToken,
      };
    },
    {
      beforeHandle({ cookie: { refresh_token: refreshToken }, set }) {
        if (!refreshToken) {
          set.status = 401;
          return {
            message: "Unauthorized.",
          };
        }
      },
    }
  );
