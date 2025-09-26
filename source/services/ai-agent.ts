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

export async function generateEmbeddings(text: string) {
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
TODO`;

const systemPromptImageDescription = `
TODO
`;
