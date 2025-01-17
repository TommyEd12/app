import { Elysia, t } from "elysia";
import { db } from "../../db";
import { brandsTable, sliderContentTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { authorizeAdmin } from "../../middleware/authMiddleware";

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
        image: t.String(),
      }),beforeHandle:[authorizeAdmin]
    }
  )
  .patch(
    "/:sliderContentId",
    async ({ body, params: { sliderContentId } }) => {
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
      }), beforeHandle:[authorizeAdmin],
    }
  )
  .delete(
    "/:sliderContentId",
    async ({ params: { sliderContentId } }) => {
      await db
        .delete(sliderContentTable)
        .where(eq(sliderContentTable.id, sliderContentId));
      return "slider content deleted successfully";
    },
    {
      params: t.Object({
        sliderContentId: t.Numeric(),
      }),beforeHandle:[authorizeAdmin]
    }
  );

export default sliderContentRoutes;
