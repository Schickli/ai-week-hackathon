import {
  AssistantModelMessage,
  embed,
  generateText,
  SystemModelMessage,
  ToolModelMessage,
  UserModelMessage,
} from "ai";
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
    system: systemPromptEstimation,
    messages: messages,
  });

  return text;
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
Respond with a single numeric value representing the estimated cost in Swiss Francs.
Estimate everything on Swiss Price levels.
`;

const systemPromptImageDescription = `
You are shown multiple images that show damage to a vehicle or device.
Describe the damage in a concise manner, focusing on the visible issues and their potential impact.
Avoid making assumptions about the cause of the damage or any repairs needed. Just describe what you see in the images.
The description should be clear and to the point, suitable for generating embeddings for similarity search.
`;
