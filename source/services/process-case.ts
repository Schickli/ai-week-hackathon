import {
  CaseRepository,
  NextGenDamage,
} from "@/infrastructure/cases/case-repository";
import {
  generateCaseDescriptionForEmbeddings,
  generateEmbedding,
  promptAI,
} from "./ai-agent";
import { createClient } from "@/infrastructure/supabase/server";

export async function processCase(payload: NextGenDamage) {
  console.log("Processing case:", payload.description);
  
    // Generate Embeddings
  const result = await getEmbedding(payload);
  payload.vector = result.embedding;
  payload.ai_image_description = result.desc;

  // Search similar cases
  const similarCases = await searchSimilarCases(payload);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload.similar_cases = similarCases.map((c: any) => c.id);

  // Prompt AI for estimation
  const estimation = await promptAIForEstimation(payload, similarCases);
  payload.estimation = Number(estimation);

  console.log("Similar cases found:", similarCases);

  // Save to DB if flag is not set
  if (payload.saveToDB) {
    return await saveToDB(payload);
  }

  return payload;
}

async function getEmbedding(payload: NextGenDamage) {
  const images = payload.case_images.map((image) => {
    console.log("Image:", image.image_public_url);
    return {
      type: "image" as const,
      image: image.image_public_url,
    };
  });

  const description = await generateCaseDescriptionForEmbeddings([
    {
      role: "user",
      content: [
        ...images,
        {
          type: "text" as const,
          text: "USER DESCRIPTION" + payload.description,
        },
      ],
    },
  ]);

  console.log("Generated description for embedding:", description);

  return { embedding: await generateEmbedding(description), desc: description };
}

async function searchSimilarCases(payload: NextGenDamage) {
  const client = await createClient();

  if (!payload.vector) {
    throw new Error("Vector is required for similarity search");
  }

  const { data, error } = await client.rpc("match_documents", {
    query_embedding: payload.vector,
    match_threshold: 0.78,
    match_count: 3,
  });

  if (error) {
    console.error("Error searching similar cases:", error);
    return [];
  }

  return data;
}

async function promptAIForEstimation(
  payload: NextGenDamage,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  similarCases: any
) {
  const images = payload.case_images.map((image) => {
    console.log("Image:", image.image_public_url);
    return {
      type: "image" as const,
      image: image.image_public_url,
    };
  });

  const result = promptAI([
    {
      role: "user",
      content: [
        ...images,
        {
          type: "text" as const,
          text: "USER DESCRIPTION: " + payload.description,
        },
        {
          type: "text",
          text:
            "AI GENERATED DESCRIPTION OF THE IMAGES: " +
            payload.ai_image_description,
        },
        {
          type: "text",
          text: `SIMILAR CASES FOUND: ${JSON.stringify(similarCases)}`,
        },
      ],
    },
  ]);

  return result;
}

async function saveToDB(data: NextGenDamage) {
  return await CaseRepository.insert(data);
}
