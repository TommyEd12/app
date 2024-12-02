import { Elysia, t } from "elysia";
import { db } from "../../db";
import { brandsTable } from "../../db/schema";
import { eq } from "drizzle-orm";

const brandRoutes = new Elysia({ prefix: "/brand" })
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
  .get(
    "/",
    async () => {
      const brands = await db
        .select()
        .from(brandsTable)
      return brands;
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const {name, image} = body;
      await db.insert(brandsTable).values({
        name: name,
        image: image
      });
      return "brand added successfully";
    },
    {
      body: t.Object({
        name: t.String(),
        image: t.String()
      }),
    }
  )
  .delete(
    "/:brandId",
    async ({ params: { brandId } }) => {
      await db
        .delete(brandsTable)
        .where(eq(brandsTable.id, brandId)); 
      return ("Brand deleted successfully")
    },
    {
      params: t.Object({
        brandId: t.Numeric(),
      }),
    }
  );

export default brandRoutes;
