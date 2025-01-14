"use client"
import { useCodeContext } from "@/hooks/use-code";
import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";



// Helper function to wrap the code snippet with a React boilerplate
function wrapWithBoilerplate(snippet: string): string {
    return `
import React from "react";

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      ${snippet}
    </div>
  );
}
`;
}

export default function CodeEditor() {
    // 1. Ensure wrappedCode is defined

    const { code } = useCodeContext(); // Get the code from the context


    const wrappedCode = code
        ? wrapWithBoilerplate(code) // Wrap the code with React boilerplate
        : "// No code provided";





    return (
        <div className="w-full m-auto flex items-center justify-center">
            <TabGroup className="w-full">
                <TabList className={"flex justify-start items-center w-full h-12 bg-neutral-900 border-b border-neutral-700"}>
                    <Tab className="bg-neutral-800 px-4 py-2 h-full text-neutral-100 border-r border-neutral-700">Preview</Tab>
                    <Tab className="bg-neutral-800 px-4 py-2 h-full text-neutral-100">Code</Tab>


                </TabList>

                <SandpackProvider
                    key={wrappedCode} // Force Sandpack to reload when the code changes
                    template="react"


                    files={{
                        "/Page.tsx": {
                            code: wrappedCode, // Pass the wrapped code
                            active: true,
                        },
                        "/App.js": {
                            code: `
import React from "react";
import Page from "./Page";

export default function App() {
    return (
        <div>
            <h1>App Component</h1>
            <Page />
        </div>
    );
}
                            `,
                            active: false,
                        },
                    }}
                    options={{
                        visibleFiles: ["/Page.tsx", "/app.js"], // Show both files in tabs
                        activeFile: "/app.js", // Set app.js as the active file
                    }}
                    theme="dark"
                    className="h-[calc(100vh-16px)]"
                >
                    <SandpackLayout className="w-full h-[calc(100vh-48px)] mx-auto flex flex-col items-center justify-center overflow-y-scroll overflow-x-scroll">
                        <TabPanels className="pt-2">
                            <TabPanel>
                                <SandpackPreview className="h-[calc(100vh-48px)] w-full" />
                            </TabPanel>
                            <TabPanel>
                                <SandpackCodeEditor className="h-[calc(100vh-48px)] w-full" />
                            </TabPanel>
                        </TabPanels>
                    </SandpackLayout>
                </SandpackProvider>
            </TabGroup>
        </div>
    );
}





