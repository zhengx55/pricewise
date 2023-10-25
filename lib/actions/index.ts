"use server";

import { revalidatePath } from "next/cache";
import Product from "../db/models/product.model";
import { connectToDB } from "../db/mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(product: string) {
  if (!product) return;
  try {
    connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(product);
    if (!scrapedProduct) return;
    // store product into database
    const existingProduct = await Product.findOne({ url: scrapedProduct.url });
    let result;
    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        {
          price: scrapedProduct.currentPrice,
        },
      ];
      result = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }
    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      result,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error) {
    throw new Error(`Failed to scrape product: ${product}`);
  }
}
