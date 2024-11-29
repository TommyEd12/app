import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { createProduct } from "../controllers/productContoller";

export const db = drizzle(
  "postgres://postgres:postgres@localhost:5432/postgres"
);

