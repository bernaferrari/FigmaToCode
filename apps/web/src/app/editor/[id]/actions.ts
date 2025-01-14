"use server";

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