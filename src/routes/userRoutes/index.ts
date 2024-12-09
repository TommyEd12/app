import { Elysia, t } from "elysia";
import { getUserBuId, getUsers } from "../../controllers/userContoller";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import { OTPTable, usersTable } from "../../db/schema";
import { takeUniqueOrThrow } from "../../controllers/userContoller";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import cors from "@elysiajs/cors";
import { createOTP } from "../../utils/createOTP";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import OTPEmail from "../../emails/otp";
import { sendEmail } from "../../utils/sendEmail";

export const userRoutes = new Elysia({ prefix: "/user" })

  .use(
    jwt({
      name: "jwt",
      secret: "Fischl von Luftschloss Narfidort",
    })
  )
  .use(cors({ origin: "http://localhost:5000", credentials: true }))
  .post(
    "/login",
    async ({ jwt, cookie: { auth }, body }) => {
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
        domain: ".localhost",
        maxAge: 7 * 86400,
        path: "/",
      });

      return {
        success: true,
        data: auth,
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
  .post("/logout", ({ cookie: { auth } }) => {
    auth.set({
      httpOnly: true,
      domain: ".localhost",
      expires: new Date(100),
      path: "/",
    });
    return {
      success: true,
      message: "logout successful",
    };
  })
  .post(
    "/signUp",
    async ({ jwt, cookie: { auth }, body }) => {
      const { email, password } = body;
      try {
        const hashedPassword = await Bun.password.hash(password, {
          algorithm: "bcrypt",
        });
        console.log(email, hashedPassword);

        await db
          .insert(usersTable)
          .values({ email: email.toLowerCase(), password: hashedPassword });
        auth.set({
          value: await jwt.sign(body),
          httpOnly: true,
          maxAge: 7 * 86400,
          domain: ".localhost",
          path: "/",
        });
        return {
          success: true,
          data: auth,
          message: "Account created successfully",
        };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .get("/profile", async ({ jwt, set, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value);

    if (!profile) {
      set.status = 401;
      return "Unauthorized";
    }

    return {
      success: true,
      data: profile.email,
      message: "login successful",
    };
  })
  .get("/:id", ({ params: { id } }) => getUserBuId(id), {
    params: t.Object({
      id: t.Numeric(),
    }),
  })
  .get(
    "/getUserByEmail",
    async ({ query }) => {
      const { email } = query;
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
      return user;
    },
    {
      query: t.Object({
        email: t.String(),
      }),
    }
  )
  .post(
    "/OTP",
    async ({ body }) => {
      try {
        const { email, subject, message, duration } = body;
        if (!email) {
          throw Error("An email, subject, message, duration are required");
        }
        await db.delete(OTPTable).where(eq(OTPTable.email, email));
        const generatedOTP = await createOTP();
        const html = renderToStaticMarkup(OTPEmail(generatedOTP));
        const mailOptions = {
          from: Bun.env.AUTH_EMAIL!,
          to: email,
          subject,
          html,
        };
        await sendEmail(mailOptions);
      } catch (error) {}
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        subject: t.String(),
        message: t.String(),
        duration: t.Numeric({ default: 1 }),
      }),
    }
  );

export default userRoutes;
