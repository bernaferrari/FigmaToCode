import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

export default function CodeEditor({ code }: { code: string | null }) {
    return (
        <div className="w-full m-auto flex items-center justify-center">
            <TabGroup className="w-full">
                <TabList className={"flex justify-start items-center w-full h-12 bg-neutral-900 border-b border-neutral-700"}>
                    <Tab className="bg-neutral-800 px-4 py-2 h-full text-neutral-100 border-r border-neutral-700">Code</Tab>
                    <Tab className="bg-neutral-800 px-4 py-2 h-full text-neutral-100">Preview</Tab>
                </TabList>
                <SandpackProvider
                    template="react"
                    files={{
                        "/App.tsx": {
                            code: code || "// Your code will appear here",
                            active: true, // Ensures App.tsx is the active file in the editor
                        },
                        "/app.js": {
                            code: "<App />",
                        },
                    }}
                    options={{
                        visibleFiles: ["/App.tsx"], // Restricts visible files to only App.tsx
                    }}
                    theme={'dark'}
                    className="h-[calc(100vh-16px)]"
                >
                    <SandpackLayout className="w-full h-[calc(100vh-48px)] mx-auto flex flex-col items-center justify-center overflow-y-scroll overflow-x-scroll">
                        <TabPanels className={"pt-2"}>
                            <TabPanel>
                                <SandpackCodeEditor className="h-[calc(100vh-48px)] w-full" />
                            </TabPanel>
                            <TabPanel>
                                <SandpackPreview className="h-[calc(100vh-48px)] w-full" />
                            </TabPanel>
                        </TabPanels>
                    </SandpackLayout>
                </SandpackProvider>
            </TabGroup>
        </div>

    );
}

