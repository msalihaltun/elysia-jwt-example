import { Elysia, t } from "elysia";
import { prisma } from "../../prisma/prisma";
import cookie from "@elysiajs/cookie";
import { randomUUID } from "crypto";
import { basicAuthModel, jwtAccessSetup, jwtRefreshSetup } from "./setup";

export const register = new Elysia()
  .use(basicAuthModel)
  .use(cookie())
  .use(jwtAccessSetup)
  .use(jwtRefreshSetup)
  .post(
    "/register",
    async function handler({ body, set, jwtAccess, jwtRefresh, setCookie }) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
      if (existingUser) {
        set.status = 400;
        return {
          message: "Email already in use.",
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
      setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 86400,
      });
      return {
        accessToken,
      };
    },
    {
      body: "basicAuthModel",
    }
  );
