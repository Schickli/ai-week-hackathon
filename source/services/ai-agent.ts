import {
  AssistantModelMessage,
  embed,
  generateText,
  stepCountIs,
  SystemModelMessage,
  tool,
  ToolModelMessage,
  UserModelMessage,
} from "ai";
import { scrapeProductPrices } from "./serpapi-scraper";
import { z } from "zod";
import { createAzure } from "@ai-sdk/azure";

const azure = createAzure();

export async function promptAI(
  messages: Array<
    | SystemModelMessage
    | UserModelMessage
    | AssistantModelMessage
    | ToolModelMessage
  >
) {
  const { text } = await generateText({
    model: azure("gpt-5"),
    // tools: {
    //   getProductPrices: tool({
    //     description: "Get prices for a product name using SerpAPI Google Shopping.",
    //     inputSchema: z.object({
    //       productName: z.string(),
    //     }),
    //     execute: async ({ productName }) => ({
    //       products: await scrapeProductPrices(productName),
    //     }),
    //   }),
    // },
    system: systemPromptEstimation,
    messages,
  });

  return text.trim(); // Should always be a numeric value

}

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: azure.textEmbeddingModel("text-embedding-3-large"),
    value: text,
  });

  return embedding;
}

export async function generateCaseDescriptionForEmbeddings(
  messages: Array<
    | SystemModelMessage
    | UserModelMessage
    | AssistantModelMessage
    | ToolModelMessage
  >
) {
  const { text } = await generateText({
    model: azure("gpt-5"),
    system: systemPromptImageDescription,
    messages: messages,
  });

  return text;
}

const systemPromptEstimation = `
You are an AI assistant that helps to estimate repair costs based on descriptions of damage and similar past cases.
Given a description of the damage and a list of similar cases with their repair costs, provide a concise cost estimate for the new case.
If there are no similar cases, provide a rough estimate based on the description alone.
ALWAYS use the provided webscraping tool to get a price range for specific products mentioned in the description. Do not search for a specific part replacement, search for the general (new) product. Use this pricing information to readjust/ground your estimate accordingly.
ALWAYS Respond with a SINGLE numeric value representing the estimated cost in Swiss Francs.
Estimate everything on Swiss Price levels.
`;

const systemPromptImageDescription = `
You are shown multiple images that show damage to a vehicle or device.
Describe the damage in a concise manner, focusing on the visible issues and their potential impact.
Avoid making assumptions about the cause of the damage or any repairs needed. Just describe what you see in the images.
The description should be clear and to the point, suitable for generating embeddings for similarity search.
`;
