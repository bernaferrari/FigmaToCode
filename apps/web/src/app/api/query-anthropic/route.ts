import { NextResponse } from 'next/server';

/**
 * POST /api/anthropic
 * 
 * Expects JSON body: { prompt: string }
 */
export async function POST(request: Request) {
    try {
        // 1. Parse the incoming JSON
        const { prompt } = await request.json() as { prompt: string };

        if (!prompt) {
            return NextResponse.json({ error: 'Missing "prompt" in request body.' }, { status: 400 });
        }

        // 2. Prepare your API call to Anthropic
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicApiKey) {
            return NextResponse.json(
                { error: 'Anthropic API key not configured on the server.' },
                { status: 500 }
            );
        }

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicApiKey,
            },
            body: JSON.stringify({
                prompt: prompt,
                model: 'claude-v1',  // or claude-instant-v1, etc.
                max_tokens_to_sample: 256,
                temperature: 0.7
            }),
        });

        if (!anthropicResponse.ok) {
            const error = await anthropicResponse.json();
            return NextResponse.json(
                { error: 'Error from Anthropic', details: error },
                { status: anthropicResponse.status }
            );
        }

        const completionData = await anthropicResponse.json();

        return NextResponse.json({
            completion: completionData.completion ?? '(No completion returned)',
            raw: completionData,
        });
    } catch (err: any) {
        console.error('Error querying Anthropic:', err);
        return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 });
    }
}
