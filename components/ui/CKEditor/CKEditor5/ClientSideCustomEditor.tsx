// components/client-side-custom-editor.js
"use client"; // Required only in App Router.

import dynamic from "next/dynamic";
import { CustomEditorProps } from "@/components/ui/CKEditor/CKEditor5/CKEditor5";

const DynamicEditor = dynamic(() => import("@/components/ui/CKEditor/CKEditor5/CKEditor5"), {
    ssr: false,
});

export default function ClientSideCustomEditor(props: CustomEditorProps) {
    return <DynamicEditor {...props} />;
}
