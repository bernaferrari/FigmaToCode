"use client";

import React, { createContext, useContext, useState } from "react";

interface CodeContextValue {
    code: string;
    setCode: (newCode: string) => void;
}

const CodeContext = createContext<CodeContextValue | undefined>(undefined);

interface CodeProviderProps {
    children: React.ReactNode;
    initialCode: string; // Add the initialCode prop type
}

export const CodeProvider: React.FC<CodeProviderProps> = ({ children, initialCode }) => {
    const [code, setCode] = useState(initialCode);

    return (
        <CodeContext.Provider value={{ code, setCode }}>
            {children}
        </CodeContext.Provider>
    );
};

export const useCodeContext = () => {
    const context = useContext(CodeContext);
    if (!context) {
        throw new Error("useCodeContext must be used within a CodeProvider");
    }
    return context;
};
