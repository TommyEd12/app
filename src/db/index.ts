import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { createProduct } from "../controllers/productContoller";

export const db = drizzle(
  Bun.env.DBSTRING || "postgres://postgres:postgres@localhost:5432/postgres"
);

// export const db2 = drizzle({schema: schema });

// db2.query.usersTable.findFirst;
