import { Elysia, t } from "elysia";
import { db } from "../../db";
import { orderProducts, ordersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

const orderProductsRoutes = new Elysia({ prefix: "/orderProducts" })
  .get(
    "/:orderId",
    async ({ params: { orderId } }) => {
      const products = await db
        .select({
          productId: orderProducts.productId,
          quantity: orderProducts.quantity,
        })
        .from(orderProducts)
        .where(eq(orderProducts.orderId, orderId));
        return(products)
    },
    {
      params: t.Object({
        orderId: t.Numeric(),
      }),
    }
  )
  .post(
    "/",
    async ({ body }) => {
      const { id, orderId, productId, quantity } = body;
      await db.insert(orderProducts).values({
        id: id,
        orderId: orderId,
        productId: productId,
        quantity: quantity,
      });
      return("products added successfully")
    },
    {
      body: t.Object({
        id: t.Numeric(),
        orderId: t.Numeric(),
        productId: t.Numeric(),
        quantity: t.Numeric(),
      }),
    }
  );

export default orderProductsRoutes;
