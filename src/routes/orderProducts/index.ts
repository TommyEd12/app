import { Elysia, t } from "elysia";
import { db } from "../../db";
import { orderProducts, ordersTable, productsTable } from "../../db/schema";
import { eq } from "drizzle-orm";

const orderProductsRoutes = new Elysia({ prefix: "/orderProducts" })
  .get(
    "/:orderId",
    async ({ params: { orderId } }) => {
      const products = await db
        .select({
          productId: orderProducts.productId,
          quantity: orderProducts.quantity,
          name: productsTable.name,
          price: productsTable.price,
        })
        .from(orderProducts)
        .leftJoin(productsTable, eq(productsTable.id, orderProducts.productId))
        .where(eq(orderProducts.orderId, orderId));
      return products;
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
      const { orderId, productId, quantity } = body;
      try {
        await db.insert(orderProducts).values({
          orderId: orderId,
          productId: productId,
          quantity: quantity,
        });
      } catch (error) {
        return error;
      }
      return {
        success: true,
        data: productId,
        message: "Product added correctly",
      };
    },
    {
      body: t.Object({
        orderId: t.Numeric(),
        productId: t.Numeric(),
        quantity: t.Numeric(),
      }),
    }
  );

export default orderProductsRoutes;
