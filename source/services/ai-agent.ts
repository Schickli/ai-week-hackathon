import { AssistantModelMessage, generateText, SystemModelMessage, ToolModelMessage, UserModelMessage } from "ai";
import { createAzure } from '@ai-sdk/azure';

const azure = createAzure();

export async function promptAI(messages: Array<SystemModelMessage | UserModelMessage | AssistantModelMessage | ToolModelMessage>) {
  const { text } = await generateText({
    model: azure("gpt-5"),
    system: systemPrompt,
    messages: messages
  });

  return text;
}

const systemPrompt = `
TODO`;
