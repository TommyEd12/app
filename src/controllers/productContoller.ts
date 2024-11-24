import { db } from "../db";
import { productsTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getProducts() {
  try {
    return await db.select().from(productsTable);
  } catch (e: unknown) {
    console.log(`Error getting users:${e}`);
  }
}

export async function createProduct(options: {
  name: string;
  price: number;
  discountPrice: number;
  count: number;
  description: string;
  categoryId: number;
  brandId: number;
  images: string[];
}) {
  try {
    const {
      name,
      price,
      discountPrice,
      count,
      description,
      categoryId,
      brandId,
      images,
    } = options;
    await db
      .insert(productsTable)
      .values({
        name: name,
        price: price,
        discountPrice: discountPrice,
        count: count,
        description: description,
        categoryId: categoryId,
        brandId: brandId,
        images: images,
      });
  } catch (e: unknown) {
    console.log(`Error creating product:${e}`);
  }
}
