import { Elysia, t } from "elysia";
import { createProduct, getProducts } from "../../controllers/productContoller";

const productRoutes = new Elysia({ prefix: "/product" })
  .get("/", () => getProducts)
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
  );

export default productRoutes;
