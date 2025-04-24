// components/client-side-custom-editor.js
"use client"; // Required only in App Router.

import dynamic from "next/dynamic";
import { CKEditorProps } from "@/components/ui/CKEditor/TinyMCE/CKEditor";

const DynamicEditor = dynamic(() => import("@/components/ui/CKEditor/TinyMCE/CKEditor"), {
    ssr: false,
});

export default function ClientSideCustomEditor(props: CKEditorProps) {
    return <DynamicEditor {...props} />;
}
