import { Elysia, t } from "elysia";
import { db } from "../../db";
import { brandsTable, sliderContentTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import jwt from "@elysiajs/jwt";

const sliderContentRoutes = new Elysia({ prefix: "/sliderContent" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .get(
    "/:sliderContentId",
    async ({ params: { sliderContentId } }) => {
      const sliderContent = await db
        .select()
        .from(sliderContentTable)
        .where(eq(sliderContentTable.id, sliderContentId));
      return sliderContent;
    },
    {
      params: t.Object({
        sliderContentId: t.Numeric(),
      }),
    }
  )
  .get("/", async () => {
    const sliderContent = await db.select().from(sliderContentTable);
    return sliderContent;
  })
  .post(
    "/",
    async ({ body, jwt, set, cookie: { auth } }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      const { buttonTitle, buttonLink, image } = body;
      await db.insert(sliderContentTable).values({
        buttonTitle: buttonTitle,
        buttonLink: buttonLink,
        image: image,
      });
      return "slider content added successfully";
    },
    {
      body: t.Object({
        buttonTitle: t.String(),
        buttonLink: t.String(),
        image: t.String(),
      }),
    }
  )
  .patch(
    "/:sliderContentId",
    async ({
      body,
      params: { sliderContentId },
      set,
      jwt,
      cookie: { auth },
    }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      const { buttonTitle, buttonLink, image } = body;
      await db
        .update(sliderContentTable)
        .set({
          buttonTitle: buttonTitle,
          buttonLink: buttonLink,
          image: image,
        })
        .where(eq(sliderContentTable.id, sliderContentId));
      return "slider content changed successfully";
    },
    {
      body: t.Object({
        buttonTitle: t.String(),
        buttonLink: t.String(),
        image: t.String(),
      }),
      params: t.Object({
        sliderContentId: t.Numeric(),
      }),
    }
  )
  .delete(
    "/:sliderContentId",
    async ({ params: { sliderContentId }, jwt, set, cookie: { auth } }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      await db
        .delete(sliderContentTable)
        .where(eq(sliderContentTable.id, sliderContentId));
      return "slider content deleted successfully";
    },
    {
      params: t.Object({
        sliderContentId: t.Numeric(),
      }),
      beforeHandle: [authorizeAdmin],
    }
  );

export default sliderContentRoutes;
