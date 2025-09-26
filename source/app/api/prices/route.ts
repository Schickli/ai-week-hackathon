import { scrapeProductPrices } from '../../../services/serpapi-scraper';
import { NextRequest, NextResponse } from 'next/server';
import { promptAI } from '../../../services/ai-agent';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('image_url');
    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing image_url parameter' }, { status: 400 });
    }

    // Step 1: Download image and convert to base64
    let imageBase64: string | null = null;
    try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error('Failed to fetch image');
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = buffer.toString('base64');
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch or process image' }, { status: 500 });
    }

    // Step 2: Prompt AI agent for product name
    let productName: string | null = null;
    try {
        const aiPrompt = [
            {
                role: 'system' as const,
                content: 'You are an expert product identifier. Given an image, describe exactly what product is shown in the photo. Be specific and concise.'
            },
            {
                role: 'user' as const,
                content: `Here is a product image (base64): ${imageBase64}`
            }
        ];
        productName = await promptAI(aiPrompt);
        console.log('Identified product name:', productName);
        if (!productName) throw new Error('AI agent did not return a product name');
    } catch (err) {
        return NextResponse.json({ error: 'Failed to identify product from image' }, { status: 500 });
    }

    // Step 3: Scrape prices from SerpAPI
    let prices = [];
    try {
        prices = await scrapeProductPrices(productName);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to scrape prices', productName }, { status: 500 });
    }

    return NextResponse.json({ productName, prices });
}
