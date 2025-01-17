import { Elysia, t } from "elysia";
import { db } from "../../db";
import { categoriesTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { authorizeAdmin } from "../../middleware/authMiddleware";

const categoryRoutes = new Elysia({ prefix: "/category" })
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
    async ({ body }) => {
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
      beforeHandle: [authorizeAdmin],
    }
  )
  .delete(
    "/:categoryId",
    async ({ params: { categoryId } }) => {
      await db
        .delete(categoriesTable)
        .where(eq(categoriesTable.id, categoryId)); 
      return ("Category deleted successfully")
    },
    {
      params: t.Object({
        categoryId: t.Numeric(),
      }),
      beforeHandle: [authorizeAdmin],
    }
  );

export default categoryRoutes;
