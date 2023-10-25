"use client";
import React, { FormEvent, useState } from "react";
import { scrapeAndStoreProduct } from "../../lib/actions";

type Props = {};

const isValidAmazonProductURL = (url: string): boolean => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;
    // check if hostname contains amazon.com or amazon.**
    if (
      hostname.indexOf("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
    }
    return true;
  } catch (error) {
    return false;
  }
};

const SearchBar = (props: Props) => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isVlidLink = isValidAmazonProductURL(searchPrompt);
    if (!isVlidLink) return;
    try {
      setLoading(true);
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      action=""
      className="flex flex-wrap gap-4 mt-12"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />
      <button type="button" className="searchbar-btn">
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
