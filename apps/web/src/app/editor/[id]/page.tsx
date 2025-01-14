import getCodeById, { modifyCodeWithAnthropic } from "./actions";
import EditorShell from "@/components/editor-shell";

interface EditorPageProps {
    params: { id: string };
}

export default async function Editor({ params }: EditorPageProps) {
    const { id } = await params;

    const codeQuery = await getCodeById(id);
    const code = await modifyCodeWithAnthropic(codeQuery?.code!);


    return (
        <div className="w-full h-screen flex bg-neutral-900 ">
            <EditorShell initialCode={code!} />
        </div>
    );
}
