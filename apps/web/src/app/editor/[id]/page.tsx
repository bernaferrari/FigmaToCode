interface EditorPageProps {
    params: { id: string };
}

export default function Editor({ params }: EditorPageProps) {
    const { id } = params;

    return (
        <div className="w-full h-screen">
            <h1>Editor Page for ID: {id}</h1>
        </div>
    );
}
