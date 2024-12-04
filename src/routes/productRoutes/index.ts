import { Elysia, t } from "elysia";
import {
  createProduct,
  getProductBuId,
  getProducts,
  updateProduct,
} from "../../controllers/productContoller";
import { db } from "../../db";
import { productsTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import cors from "@elysiajs/cors";

const productRoutes = new Elysia({ prefix: "/product" })

  .get("/", () => getProducts)
  .get(
    "/:productId",
    ({ params: { productId } }) => getProductBuId(productId),
    {
      params: t.Object({
        productId: t.Numeric(),
      }),
    }
  )
  .patch(
    "/:productId",
    (
      {
        body: {
          name,
          price,
          discountPrice,
          count,
          description,
          categoryId,
          brandId,
          images,
        },
        params:{ productId}
      }
    ) =>
      updateProduct(productId, {
        name,
        price,
        discountPrice,
        count,
        description,
        categoryId,
        brandId,
        images,
      }),
    {
      body: t.Object({
        name: t.String(),
        price: t.Numeric(),
        discountPrice: t.Numeric(),
        count: t.Numeric(),
        description: t.String(),
        categoryId: t.Numeric(),
        brandId: t.Numeric(),
        images: t.Array(t.String()),
      }),
      params: t.Object({
        productId: t.Numeric(),
      }),
    }
  )
  .post(
    "/",
    ({
      body: {
        name,
        price,
        discountPrice,
        count,
        description,
        categoryId,
        brandId,
        images,
      },
    }) =>
      createProduct({
        name,
        price,
        discountPrice,
        count,
        description,
        categoryId,
        brandId,
        images,
      }),
    {
      body: t.Object({
        name: t.String(),
        price: t.Numeric(),
        discountPrice: t.Numeric(),
        count: t.Numeric(),
        description: t.String(),
        categoryId: t.Numeric(),
        brandId: t.Numeric(),
        images: t.Array(t.String()),
      }),
    }
  )
  .delete(
    "/:productId",
    async ({ params: { productId } }) => {
      await db
        .delete(productsTable)
        .where(eq(productsTable.id, productId)); 
      return ("product deleted successfully")
    },
    {
      params: t.Object({
        productId: t.Numeric(),
      }),
    }
  );

export default productRoutes;
