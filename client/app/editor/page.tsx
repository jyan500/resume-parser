"use client"

import dynamic from "next/dynamic";

// The editor route is fully client-only — @react-pdf/renderer and react-pdf
// both depend on browser APIs (canvas, web workers) that don't exist on the
// server. ssr: false ensures Next never tries to render this on the server.
const EditorView = dynamic(
	() => import("../_components/EditorView").then((m) => m.EditorView),
	{ ssr: false }
);

export default function EditorPage() {
	return <EditorView />;
}
