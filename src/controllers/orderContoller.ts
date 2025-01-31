import { db } from "../db";
import { ordersTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

export type status = "Created" | "InProgress" | "Finished";
export async function getOrders() {
  try {
    return await db.select().from(ordersTable);
  } catch (e: unknown) {
    console.log(`Error getting users:${e}`);
  }
}
export async function getUsersOrders(userId: number) {
  try {
    const usersOrders = await db
      .select({
        orderId: ordersTable.id,
        status: ordersTable.status,
        usersId: usersTable.id,
        usersEmail: usersTable.email,
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .where(eq(ordersTable.userId, userId));
    return usersOrders;
  } catch (e: unknown) {
    console.log(`Error getting users orders:${e}`);
  }
}
export async function createOrder(options: {
  userId: number;
  status: status;
  address: string;
  postIndex: number;
}) {
  try {
    const { userId, status, address, postIndex } = options;
    const newRecord = await db
      .insert(ordersTable)
      .values({
        userId: userId,
        status: status,
        address: address,
        postIndex: postIndex,
      })
      .returning({ id: ordersTable.id });
    return newRecord[0].id;
  } catch (e: unknown) {
    console.log(`Error creating order:${e}`);
  }
}
