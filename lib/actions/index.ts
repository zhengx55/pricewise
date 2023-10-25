"use server";

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(product: string) {
  if (!product) return;
  try {
    const scrapedProduct = await scrapeAmazonProduct(product);
  } catch (error) {
    throw new Error(`Failed to scrape product: ${product}`);
  }
}
