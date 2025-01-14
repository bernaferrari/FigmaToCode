import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const basePrompt = 'You are a helpful AI assistant that has an eye for design. You will be given jsx that is styled using inline styles. Based upon this design, users will ask you to make tweaks to the design of the UI component. The existing code is provided to you and so is the user request. You must only return code and you will not describe anything. If it is not code, you MUST not return it.'

export async function POST(request: Request) {
    try {
        const { message, code } = await request.json() as { message: string; code: string };

        if (!message || !code) {
            return NextResponse.json(
                { error: 'Both "message" and "code" are required in the request body.' },
                { status: 400 }
            );
        }

        const prompt = `Given the following code, please make the following changes: ${message}\n\n${code}`;

        // Construct the messages array more explicitly
        const messages = [
            {
                role: 'user' as const,
                content: [
                    {
                        type: 'text' as const,
                        text: prompt
                    }
                ]
            },

        ];

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: messages,
            system: basePrompt,
            temperature: 0.7
        });

        // Handle the response more carefully
        if (!response.content || response.content.length === 0) {
            throw new Error('No content in response');
        }

        const textContent = response.content.find(c => c.type === 'text');
        if (!textContent || !('text' in textContent)) {
            throw new Error('No text content found in response');
        }

        return NextResponse.json({ completion: textContent.text }, { status: 200 });

    } catch (error) {
        console.error('Error processing request:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Anthropic API Error: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'An unknown error occurred.' },
            { status: 500 }
        );
    }
}
