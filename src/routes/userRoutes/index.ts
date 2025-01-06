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
import { DateTime } from "luxon";

export const userRoutes = new Elysia({ prefix: "/user" })

  .use(
    jwt({
      name: "jwt",
      secret: "Fischl von Luftschloss Narfidort",
    })
  )
  .use(cors({ origin: ["http://musandco", "http://localhost:5000"], credentials: true }))
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
      return {
        success: true,
        data: user,
        message: "user found",
      };
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
        const { email } = body;
        if (!email) {
          throw Error("An email is required");
        }
        const subject = "Сброс пароля";
        const duration = 10;
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
        const hashedOTP = await Bun.password.hash(generatedOTP.toString(), {
          algorithm: "bcrypt",
        });
        const now = DateTime.now();
        const expiresAt = now.plus({ minutes: duration });
        const newOTP = {
          email: email,
          OTP: hashedOTP,
          CreatedAt: now.toISO(),
          ExpiresAt: expiresAt.toISO(),
        };
        await db.insert(OTPTable).values(newOTP);
      } catch (error) {}
    },
    {
      body: t.Object({
        email: t.String({ format: "email" })
      }),
    }
  )
  .post("/sendOTP", async () => {
    const generatedOTP = await createOTP();
    const hashedOTP = await Bun.password.hash(generatedOTP.toString(), {
      algorithm: "bcrypt",
    });
    const now = DateTime.now();
    const expiresAt = now.plus({ hours: 1 });
    const newOTP = {
      email: "test@mail.com",
      OTP: hashedOTP,
      CreatedAt: now.toISO(),
      ExpiresAt: expiresAt.toISO(),
    };
    await db.insert(OTPTable).values(newOTP);
  })
  .get("/OTP", async () => {
    const OTPs = await db.select().from(OTPTable);
    return OTPs;
  })
  .post(
    "/resetPassword",
    async ({ body }) => {
      try {
        const { email, newPassword, otp } = body;
        if (!(email && otp)) {
          throw Error("Provide values for email, otp");
        }
        const matchedOTPRecords = await db
          .select()
          .from(OTPTable)
          .where(eq(OTPTable.email, email));
        const matchedOTPRecord = matchedOTPRecords[0];
        if (!matchedOTPRecord) {
          return { success: false, error: "No otp records found" };
        }
        const expiresAt = DateTime.fromISO(matchedOTPRecord.ExpiresAt);
        if (expiresAt < DateTime.fromISO(Date.now())) {
          await db.delete(OTPTable).where(eq(OTPTable.email, email));
        }
        const isCorrectOTP = await Bun.password.verify(
          otp,
          matchedOTPRecord.OTP,
          "bcrypt"
        );
        if (!isCorrectOTP) {
          return { success: false, error: "Otp is incorrect" };
        }
        const hashedPassword = await Bun.password.hash(newPassword, {
          algorithm: "bcrypt",
        });
        await db
          .update(usersTable)
          .set({ password: hashedPassword })
          .where(eq(usersTable.email, email));
        return {
          success: true,
          data: isCorrectOTP,
          message: "OTP is correct",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      body: t.Object({
        otp: t.String(),
        email: t.String(),
        newPassword: t.String({ minLength: 8 }),
      }),
    }
  );

export default userRoutes;
