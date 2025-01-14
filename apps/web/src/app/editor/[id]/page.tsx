import CodeEditor from "@/components/codeEditor";
import getCodeById from "./actions";
import Chat from "@/components/chat";

interface EditorPageProps {
    params: { id: string };
}

export default async function Editor({ params }: EditorPageProps) {
    const { id } = params;

    const codeQuery = await getCodeById(id);

    return (
        <div className="w-full h-screen flex bg-neutral-900 ">
            <div className="h-screen w-1/2">
                <Chat />
            </div>
            <div className="h-screen w-1/2">
                <CodeEditor code={codeQuery?.code!} />
            </div>
        </div>
    );
}
