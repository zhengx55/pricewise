"use server";
import { revalidatePath } from "next/cache";
import Product from "../db/models/product.model";
import { connectToDB } from "../db/mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { Product as ProductType, User } from "@/types";
import { generateEmailBody } from "../nodemailer";

export async function scrapeAndStoreProduct(productId: string) {
  if (!productId) return;
  try {
    connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productId);
    if (!scrapedProduct) return;
    // store product into database
    const existingProduct = await Product.findOne({ url: scrapedProduct.url });
    let product = scrapedProduct;
    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();
    const product: ProductType | null = await Product.findById(productId);
    return product;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();
    const products: ProductType[] = await Product.find();
    return products;
  } catch (error) {
    console.error(error);
  }
}

export async function getSimilarProducts(product: string) {
  try {
    connectToDB();
    const currentProduct: ProductType | null = await Product.findById(product);
    if (!currentProduct) return null;
    const similarProducts = await Product.find({
      _id: { $ne: product },
    }).limit(3);
    return similarProducts;
  } catch (error) {
    console.error(error);
  }
}

export async function addUserEmailToProduct(productId: string, email: string) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;
    const userExists = product.users.some((user: User) => user.email === email);
    if (!userExists) {
      product.users.push({ email });
      await product.save();
      const emailContent = generateEmailBody(product, "WELCOME");
    }
  } catch (error) {
    console.error(error);
  }
}
