import { Elysia, t } from "elysia";
import {
  createProduct,
  getProductBuId,
  getProducts,
  updateProduct,
} from "../../controllers/productContoller";

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
  );

export default productRoutes;
