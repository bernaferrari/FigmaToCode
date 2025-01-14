"use client";

import React from "react";
import { CodeProvider } from "@/hooks/use-code"; // Context provider
import CodeEditor from "@/components/codeEditor";
import Chat from "@/components/chat";

interface EditorShellProps {
    initialCode: string;
}

export default function EditorShell({ initialCode }: EditorShellProps) {
    return (
        <CodeProvider initialCode={initialCode}>
            <div className="w-full h-screen flex bg-neutral-900">
                <div className="h-screen w-1/2 border-r border-neutral-700">
                    <Chat />
                </div>
                <div className="h-screen w-1/2">
                    <CodeEditor />
                </div>
            </div>
        </CodeProvider>
    );
}
