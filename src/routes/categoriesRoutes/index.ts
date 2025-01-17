import { Elysia, t } from "elysia";
import { db } from "../../db";
import { categoriesTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import jwt from "@elysiajs/jwt";

const categoryRoutes = new Elysia({ prefix: "/category" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .get(
    "/:categoryId",
    async ({ params: { categoryId } }) => {
      const category = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, categoryId));
      return category;
    },
    {
      params: t.Object({
        categoryId: t.Numeric(),
      }),
    }
  )
  .get("/", async () => {
    const categories = await db.select().from(categoriesTable);
    return categories;
  })
  .post(
    "/",
    async ({ jwt, set, body, cookie: { auth } }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      const { name } = body;
      await db.insert(categoriesTable).values({
        name: name,
      });
      return "category added successfully";
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .delete(
    "/:categoryId",
    async ({ jwt, cookie: { auth }, set, params: { categoryId } }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      await db
        .delete(categoriesTable)
        .where(eq(categoriesTable.id, categoryId));
      return "Category deleted successfully";
    },
    {
      params: t.Object({
        categoryId: t.Numeric(),
      }),
    }
  );

export default categoryRoutes;
