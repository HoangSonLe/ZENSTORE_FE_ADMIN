// components/client-side-custom-editor.js
"use client"; // Required only in App Router.

import dynamic from "next/dynamic";
import { UncontrolledEditorProps } from "@/components/ui/TinyMCE/UncontrolledEditor";

const DynamicEditor = dynamic(() => import("@/components/ui/TinyMCE/UncontrolledEditor"), {
    ssr: false,
});

export interface ClientSideCustomEditorProps extends UncontrolledEditorProps {}

export default function ClientSideCustomEditor(props: ClientSideCustomEditorProps) {
    return <DynamicEditor {...props} />;
}
