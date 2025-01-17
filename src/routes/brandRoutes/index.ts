import { Elysia, t } from "elysia";
import { db } from "../../db";
import { brandsTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import jwt from "@elysiajs/jwt";

const brandRoutes = new Elysia({ prefix: "/brand" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .get(
    "/:brandId",
    async ({ params: { brandId } }) => {
      const brand = await db
        .select()
        .from(brandsTable)
        .where(eq(brandsTable.id, brandId));
      return brand;
    },
    {
      params: t.Object({
        brandId: t.Numeric(),
      }),
    }
  )
  .get("/", async () => {
    const brands = await db.select().from(brandsTable);
    return brands;
  })
  .post(
    "/",
    async ({ jwt, set, cookie: { auth }, body }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      const { name, image } = body;
      await db.insert(brandsTable).values({
        name: name,
        image: image,
      });
      return "brand added successfully";
    },
    {
      body: t.Object({
        name: t.String(),
        image: t.String(),
      }),
    }
  )
  .delete(
    "/:brandId",
    async ({ jwt, set, cookie: { auth }, params: { brandId } }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      await db.delete(brandsTable).where(eq(brandsTable.id, brandId));
      return "Brand deleted successfully";
    },
    {
      params: t.Object({
        brandId: t.Numeric(),
      }),
    }
  );

export default brandRoutes;
