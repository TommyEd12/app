import { eq } from "drizzle-orm";
import { db } from "../db";
import { ordersTable } from "../db/schema";
import { status } from "../controllers/orderContoller";

export const updateOrderStatus = async (orderId: number, status: status) => {
  await db
    .update(ordersTable)
    .set({ status: status })
    .where(eq(ordersTable.id, orderId));

  // Example of handling errors:
  //  throw new Error("Failed to update order");
};
