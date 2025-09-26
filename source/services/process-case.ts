import { CaseRepository, NextGenDamage, NextGenDamageInserted } from "@/infrastructure/cases/case-repository";

export async function processCase(payload: NextGenDamage): Promise<NextGenDamageInserted> {
    // Generate Embeddings
    generateEmbeddings();

    // Search similar cases 
    searchSimilarCases();

    // Prompt AI for estimation
    promptAIForEstimation();

    // Save to DB if flag is not set
    return await saveToDB(payload);

    // return null; return the whole case object (for benchmarking)
}

async function generateEmbeddings() {
    // TODO
}

async function searchSimilarCases() {
    // TODO
}

async function promptAIForEstimation() {
    // TODO
}

async function saveToDB(data: NextGenDamage): Promise<NextGenDamageInserted> {
    return await CaseRepository.insert(data)
}

