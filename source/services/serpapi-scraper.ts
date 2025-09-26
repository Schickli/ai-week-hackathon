// /services/serpapi-scraper.ts
// Uses built-in fetch (Next.js/Node >=18)
const SERPAPI_KEY = process.env.SERPAPI_KEY;

type PriceResult = {
  title: string;
  price: string;
  link: string;
  source: string;
  thumbnail: string;
};

/**
 * Step 1: Use Google Image Search via SerpApi to detect the product from image URL
 * @param {string} imageUrl - URL of the uploaded image
 * @returns {string} - Detected product name or description
 */
export async function detectProductFromImage(imageUrl: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      engine: 'google_reverse_image',
      image_url: imageUrl,
      api_key: SERPAPI_KEY ?? '',
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`SerpApi request failed: ${response.status}`);
    }

    const data = await response.json();
    // SerpAPI returns best_guess in image_results[0]
    const productName = data.image_results?.[0]?.best_guess || null;
    return productName;
  } catch (error) {
    console.error('Error detecting product from image:', error);
    return null;
  }
}

/**
 * Step 2: Search for prices of the detected product using SerpApi Google Search API
 * @param {string} productName
 * @param {number} limit - max number of price results to return
 * @returns {Array<{title: string, price: string, link: string, source: string, thumbnail: string}>} - structured price results
 */
export async function scrapeProductPrices(productName: string, limit: number = 5): Promise<PriceResult[]> {
  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: productName,
      tbm: 'shop', // Google Shopping
      api_key: SERPAPI_KEY ?? '',
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`SerpApi request failed: ${response.status}`);
    }

    const data = await response.json();
    const products = data.shopping_results?.slice(0, limit) || [];

    return products.map((p: any): PriceResult => ({
      title: p.title,
      price: p.price,
      link: p.link,
      source: p.source,
      thumbnail: p.thumbnail,
    }));
  } catch (error) {
    console.error('Error scraping product prices:', error);
    return [];
  }
}

/**
 * Step 3: Combined function to get product name from image and scrape prices
 * @param {string} imageUrl
 * @returns {Promise<{productName: string|null, prices: Array}>}
 */
export async function getProductAndPrices(imageUrl: string): Promise<{productName: string|null, prices: PriceResult[]}> {
  const productName = await detectProductFromImage(imageUrl);
  if (!productName) {
    return { productName: null, prices: [] };
  }
  const prices = await scrapeProductPrices(productName);
  return { productName, prices };
}
