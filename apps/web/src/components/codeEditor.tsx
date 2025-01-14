import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

export default function CodeEditor({ code }: { code: string | null }) {
    return (
        <div className="w-full h-screen m-auto flex items-center justify-center">
            <TabGroup className="">
                <TabList className={"flex justify-center items-center gap-4"}>
                        <Tab className="bg-gray-800 px-4 py-2 rounded-lg">Code</Tab>
                        <Tab className="bg-gray-800 px-4 py-2 rounded-lg">Preview</Tab>
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
        >
            <SandpackLayout className="w-[900px] h-96 mx-auto flex flex-col items-center justify-center overflow-y-scroll overflow-x-scroll">
                    <TabPanels className={"pt-2"}>
                        <TabPanel>
                            <SandpackCodeEditor className="h-96"/>
                        </TabPanel>
                        <TabPanel>
                            <SandpackPreview className="h-96"/>
                        </TabPanel>
                    </TabPanels>
            </SandpackLayout>
        </SandpackProvider>
        </TabGroup>
        </div>
    );
}

