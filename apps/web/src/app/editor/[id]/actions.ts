"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "../../../../utils/server";

type CodeGen = {
    code: string | null;
}

export default async function getCodeById(id: string): Promise<CodeGen | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("code_gen")
        .select("code")
        .eq("id", id)
        .single();

    if (error) {
        return { code: "" };
    }
    return data;
}


const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const basePrompt = "You are a helpful AI assistant that has an eye for design. You will be given jsx that is styled using inline styles. you will be given these styles and you must expand upon them and fix any obvious mistakes that will cause the code to not look good. You MUST only return code and you will not describe anything. If it is not code, you MUST not return it."

export async function modifyCodeWithAnthropic(code: string) {
    try {
        const message = await client.messages.create({
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: code
            }],
            system: basePrompt,
            model: 'claude-3-5-sonnet-latest',
        });

        return message.content[0].type === 'text' ? message.content[0].text : code;
    }
    catch (error) {
        console.error(error);
    }
}
