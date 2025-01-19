import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { createProduct } from "../controllers/productContoller";

export const db = drizzle(
  "postgres://max:123456@localhost:5432/mus?schema=public"
);

// export const db2 = drizzle({schema: schema });

// db2.query.usersTable.findFirst;
// fffc
