import { Elysia, t } from "elysia";
import { db } from "../../db";
import { brandsTable, sliderContentTable } from "../../db/schema";
import { eq } from "drizzle-orm";

const sliderContentRoutes = new Elysia({ prefix: "/sliderContent" })
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
    async ({ body }) => {
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
        image: t.Array(t.String()),
      }),
    }
  )
  .patch("/",
    async ({ body }) => {
      const { buttonTitle, buttonLink, image } = body;
      await db.update(sliderContentTable).set({
        buttonTitle: buttonTitle,
        buttonLink: buttonLink,
        image: image,
      });
      return "slider content changed successfully";
    },
    {
      body: t.Object({
        buttonTitle: t.String(),
        buttonLink: t.String(),
        image: t.Array(t.String()),
      }),
    })
  .delete(
    "/:sliderContentId",
    async ({ params: { sliderContentId } }) => {
      await db.delete(sliderContentTable).where(eq(sliderContentTable.id, sliderContentId));
      return "slider content deleted successfully";
    },
    {
      params: t.Object({
        sliderContentId: t.Numeric(),
      }),
    }
  );

export default sliderContentRoutes;
