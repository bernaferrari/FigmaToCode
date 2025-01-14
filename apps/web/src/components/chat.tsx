"use client";

import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type ChatHistory = {
    user: 'user' | 'claude';
    message: string;
}

export default function Chat() {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    const sendMessage = async () => {


        const response = await fetch("api/query-anthropic", {
            method: "POST",
            body: JSON.stringify({ prompt: message }),
        });

        if (!response.ok) {
            const { error, details } = await response.json();
            throw new Error(`${error}: ${details}`);
        }

        const { completion } = await response.json();

        setChatHistory([...chatHistory, { user: 'claude', message }]);
        return completion;

    }

    return (
        <div className="h-screen flex flex-col justify-end p-16">
            <div>
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.user === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`bg-neutral-800 p-4 rounded-xl ${chat.user === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                            {chat.message}
                        </div>
                    </div>
                ))}
            </div>
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
