export async function processCase() {
    // Generate Embeddings
    generateEmbeddings();

    // Search similar cases 
    searchSimilarCases();

    // Prompt AI for estimation
    promptAIForEstimation();

    // Save to DB if flag is not set
    saveToDB();

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

async function saveToDB() {
    // TODO Call to repository
}

