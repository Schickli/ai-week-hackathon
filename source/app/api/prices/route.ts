import { scrapeProductPrices } from '../../../services/serpapi-scraper';
import { NextRequest, NextResponse } from 'next/server';
import { promptAI } from '../../../services/ai-agent';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('image_url');
    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing image_url parameter' }, { status: 400 });
    }

    let productName: string | null = null;
    try {
        const aiPrompt = [
            {
                role: 'system' as const,
                content: 'You are an expert product identifier. Given an image, describe exactly what product is shown in the photo. Be specific and concise.'
            },
            {
                role: 'user' as const,
                content: [
                    {
                        type: 'image' as const,
                        image: imageUrl
                    }
                ]
            }
        ];
        productName = await promptAI(aiPrompt) as string;
        console.log('Identified product name:', productName);
        if (!productName) throw new Error('AI agent did not return a product name');
    } catch (err) {
        return NextResponse.json({ error: 'Failed to identify product from image' }, { status: 500 });
    }

    let prices = [];
    try {
        prices = await scrapeProductPrices(productName);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to scrape prices', productName }, { status: 500 });
    }

    return NextResponse.json({ productName, prices });
}
