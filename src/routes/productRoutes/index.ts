import { Elysia, t } from "elysia";
import {
  createProduct,
  getProductBuId,
  getProducts,
  updateProduct,
} from "../../controllers/productContoller";
import { db } from "../../db";
import { productsTable } from "../../db/schema";
import { eq, ilike, like, or } from "drizzle-orm";
import cors from "@elysiajs/cors";

import jwt from "@elysiajs/jwt";

const productRoutes = new Elysia({ prefix: "/product" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )

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
  .get("/search", ({ query }) => {
    const products = db
      .select()
      .from(productsTable)
      .where(ilike(productsTable.name, `%${query.search}%`));
    return products;
  })
  .patch(
    "/:productId",
    async ({
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
      params: { productId },
      jwt,
      set,
      cookie: { auth },
    }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      updateProduct(productId, {
        name,
        price,
        discountPrice,
        count,
        description,
        categoryId,
        brandId,
        images,
      });
    },
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
    async ({
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
      jwt,
      set,
      cookie: { auth },
    }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      createProduct({
        name,
        price,
        discountPrice,
        count,
        description,
        categoryId,
        brandId,
        images,
      });
    },
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
    async ({ params: { productId }, set, jwt, cookie: { auth } }) => {
      const profile = await jwt.verify(auth.value);
      if (!profile || profile.role != "admin") {
        set.status = 401;
        throw new Error("unathorized");
      }
      await db.delete(productsTable).where(eq(productsTable.id, productId));
      return "product deleted successfully";
    },
    {
      params: t.Object({
        productId: t.Numeric(),
      }),
    }
  );

export default productRoutes;
