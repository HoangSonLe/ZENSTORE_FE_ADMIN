// components/client-side-custom-editor.js
"use client"; // Required only in App Router.

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { UncontrolledEditorProps } from "@/components/ui/TinyMCE/UncontrolledEditor";

const DynamicEditor = dynamic(() => import("@/components/ui/TinyMCE/UncontrolledEditor"), {
    ssr: false,
});

export interface ClientSideCustomEditorProps extends UncontrolledEditorProps {}

export default function ClientSideCustomEditor(props: ClientSideCustomEditorProps) {
    // Log when value changes to help with debugging
    useEffect(() => {
        if (props.value !== undefined) {
            console.log(
                "ClientSideCustomEditor value changed:",
                props.value?.substring(0, 50) + "..."
            );
        }
    }, [props.value]);

    return <DynamicEditor {...props} />;
}
