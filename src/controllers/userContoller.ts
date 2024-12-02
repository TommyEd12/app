import { error } from "elysia";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import jwt from "@elysiajs/jwt";
import { Cookie,t } from "elysia";
 

export async function getUsers() {
  try {
    return await db.select().from(usersTable);
  } catch (e: unknown) {
    throw new Error(`Error getting users:${e}`);
  }
}
export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
  if (values.length !== 1)
    throw new Error("Found non unique or inexistent value");
  return values[0]!;
};
export async function getUserBuId(id: number) {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return user;
  } catch (e: unknown) {
    console.log(`Error getting user:${e}`);
  }
}

export type user = {
  email: string;
  password: string;
};
