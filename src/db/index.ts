import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { createProduct } from "../controllers/productContoller";

export const db = drizzle(
  "postgres://postgres:postgres@localhost:5432/postgres"
);

export function Main() {
  const product = createProduct({
    name: "jet-js300",
    price: 19900,
    discountPrice: 25500,
    description: "cool",
    count: 10,
    categoryId: 1,
    brandId: 456,
    images: ["image1.jpg", "image2.jpg"],
  });
  console.log(product);
}

Main();
