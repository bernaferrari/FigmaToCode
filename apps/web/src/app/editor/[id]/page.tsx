import CodeEditor from "@/components/codeEditor";
import getCodeById from "./actions";

interface EditorPageProps {
    params: { id: string };
}

export default async function Editor({ params }: EditorPageProps) {
    const { id } = params;

    const codeQuery = await getCodeById(id);

    return (
        <div className="w-full h-screen">
            <CodeEditor code={codeQuery?.code!} />
        </div>
    );
}
