"use client";

import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useCodeContext } from "@/hooks/use-code";



type ChatHistory = {
    user: 'user' | 'claude';
    message: string;
}

export default function Chat() {

    const { code, setCode } = useCodeContext();

    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    const sendMessage = async () => {


        try {
            const data = await fetch('/api/tweak-design', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, code }),
            });

            const response = await data.json();
            if (response.error) {
                throw new Error(response.error);
            }

            setCode(response.completion);

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Anthropic API Error: ${error.message}`);
            }
            throw error;
        }

    }

    return (
        <div className="h-screen flex flex-col justify-end p-16">

            <div className="bg-neutral-800 h-48 rounded-xl p-6">
                <textarea className="bg-neutral-800 w-full rounded-xl resize-none placeholder-neutral-300 focus:ring-0 focus:outline-none" placeholder="Tweak the design with Polymet " rows={4} onChange={(e) => setMessage(e.target.value)}>
                </textarea>
                <div className="w-full flex justify-end items-end">
                    <button
                        className="rounded-full h-8 w-8 bg-neutral-100 hover:bg-neutral-300 flex disabled:bg-neutral-500"
                        onClick={sendMessage}
                        disabled={!message}
                    >
                        <ArrowUpIcon className="h-4 w-4 text-neutral-950 m-auto" />
                    </button>
                </div>
            </div>


        </div>
    )
}
