# elysia-jwt-example
A tiny example that implements token based authentication in [bun](https://bun.sh/) and [elysia](https://elysiajs.com/).

Inspirations from [this blog post by Mihai-Adrian Andrei](https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk).

## Try locally

  - Install [bun](https://bun.sh/).
  - Clone this repository.
  - Run `bun i` to install the necessary packages.
  - Run `bunx prisma generate` to initialize the sqlite database from the prisma [schema file](prisma/schema.prisma).
  - Run `bun run dev` to start the application.
