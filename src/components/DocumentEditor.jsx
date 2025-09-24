import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export default function DocumentEditor({ workspaceId }) {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      "ws://localhost:1234", // Y-WebSocket server URL
      workspaceId,
      ydoc
    );

    const yText = ydoc.getText("document");

    const editorInstance = useEditor({
      extensions: [StarterKit],
      content: "",
      onUpdate: ({ editor }) => {
        // optional: persist to backend periodically
      },
    });

    // Bind TipTap content to Yjs text
    editorInstance?.commands.setContent(yText.toString());

    setEditor(editorInstance);

    provider.on("status", (event) => console.log(event.status));

    return () => {
      provider.destroy();
      editorInstance?.destroy();
    };
  }, [workspaceId]);

  return <EditorContent editor={editor} className="border p-4 rounded" />;
}
