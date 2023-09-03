import { Elysia, t } from "elysia";
import { prisma } from "../../../prisma/prisma";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { randomUUID } from "crypto";

export const authModel = new Elysia().model({
  basic: t.Object({
    email: t.String(),
    password: t.String(),
  }),
});

const auth = new Elysia({
  prefix: "/auth",
})
  .use(authModel)
  .use(cookie())
  .use(
    jwt({
      name: "jwtAccess",
      schema: t.Object({
        id: t.String(),
      }),
      secret: process.env.JWT_ACCESS_SECRET!,
      exp: "5m",
    })
  )
  .use(
    jwt({
      name: "jwtRefresh",
      schema: t.Object({
        id: t.String(),
      }),
      secret: process.env.JWT_REFRESH_SECRET!,
      exp: "7d",
    })
  )
  .post(
    "/register",
    async ({ body, set, jwtAccess, jwtRefresh, setCookie }) => {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
      if (existingUser) {
        set.status = 400;
        return {
          message: "User already exists.",
        };
      }
      const savedPassword = await Bun.password.hash(body.password);
      const refreshId = randomUUID();
      const refreshToken = await jwtRefresh.sign({
        id: refreshId,
      });
      const hashedToken = new Bun.CryptoHasher("sha512")
        .update(refreshToken)
        .digest("hex");

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: savedPassword,
          refreshTokens: {
            create: {
              hashedToken,
              id: refreshId,
            },
          },
        },
      });
      const accessToken = await jwtAccess.sign({
        id: String(user.id),
      });
      setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 86400,
      });
      return {
        accessToken,
      };
    },
    {
      body: "basic",
    }
  );

export { auth };
