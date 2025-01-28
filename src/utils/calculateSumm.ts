import { eq } from "drizzle-orm";
import { db } from "../db";
import { orderProducts, productsTable } from "../db/schema";

export const calculateSumm = async (orderId: number) => {
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
};
