import { CaseRepository, NextGenDamage } from "@/infrastructure/cases/case-repository";

export async function processCase(payload: NextGenDamage) {
    // Generate Embeddings
    generateEmbeddings();

    // Search similar cases 
    searchSimilarCases();

    // Prompt AI for estimation
    promptAIForEstimation();

    // Save to DB if flag is not set
    return await saveToDB(payload);
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

async function saveToDB(data: NextGenDamage) {
    return await CaseRepository.insert(data)
}

