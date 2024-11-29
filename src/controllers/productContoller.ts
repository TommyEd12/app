import { db } from "../db";
import { productsTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getProducts() {
  try {
    return await db.select().from(productsTable);
  } catch (e: unknown) {
    console.log(`Error getting products:${e}`);
  }
}

export async function updateProduct(
  productId: number,
  options: {
    name: string;
    price: number;
    discountPrice: number;
    count: number;
    description: string;
    categoryId: number;
    brandId: number;
    images: string[];
  }
) {
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
    .update(productsTable)
    .set({
      name: name,
      price: price,
      discountPrice: discountPrice,
      count: count,
      description: description,
      categoryId: categoryId,
      brandId: brandId,
      images: images,
    })
    .where(eq(productsTable.id, productId));
}

export async function getProductBuId(productId: number) {
  try {
    const product = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));
    return product;
  } catch (e: unknown) {
    console.log(`Error getting product:${e}`);
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
    await db.insert(productsTable).values({
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
