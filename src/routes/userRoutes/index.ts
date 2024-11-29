import { Elysia, t } from "elysia";

import { getUserBuId, getUsers, signUp } from "../../controllers/userContoller";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import { usersTable } from "../../db/schema";
import { takeUniqueOrThrow } from "../../controllers/userContoller";
import { eq } from "drizzle-orm";
import { db } from "../../db";

export const userRoutes = new Elysia({ prefix: "/user" })
  .use(
    jwt({
      name: "jwt",
      secret: "Fischl von Luftschloss Narfidort",
    })
  )
  .post(
    "/login",
    async ({ jwt, cookie: { auth }, body, }) => {
      const { email, password } = body;
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()))
        .then(takeUniqueOrThrow);
      if (!user) {
        throw new Error("Пользователь не найден");
      }
      const isCorrectPassword = await Bun.password.verify(
        password,
        user.password,
        "bcrypt"
      );
      if (!isCorrectPassword) {
        throw new Error("Неверный пароль");
      }
      auth.set({
        value: await jwt.sign(body),
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "http://localhost:3049/api/user/profile",
      });

      return {
        success: true,
        data: null,
        message: "Account login successfully",
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .get("/", () => getUsers())
  .post("/signUp", async ({ body: { email, password } }) => signUp(email, password), {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
  .post("/", () => "create user")
  .get("/profile", async ({ jwt, set, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value);

    if (!profile) {
      set.status = 401;
      return "Unauthorized";
    }

    return `Hello ${profile.email}`;
  })
  .get("/:id", ({ params: { id } }) => getUserBuId(id), {
    params: t.Object({
      id: t.Numeric(),
    }),
  });

export default userRoutes;
