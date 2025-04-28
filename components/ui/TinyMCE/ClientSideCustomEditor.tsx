// components/client-side-custom-editor.js
"use client"; // Required only in App Router.

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { UncontrolledEditorProps } from "@/components/ui/TinyMCE/UncontrolledEditor";

// Import the fullscreen fix script
import "./fullscreen-fix.ts";

const DynamicEditor = dynamic(() => import("@/components/ui/TinyMCE/UncontrolledEditor"), {
    ssr: false,
});

export interface ClientSideCustomEditorProps extends UncontrolledEditorProps {}

export default function ClientSideCustomEditor(props: ClientSideCustomEditorProps) {
    // Add a class to the body to help with CSS targeting
    useEffect(() => {
        document.body.classList.add("has-tinymce-editor");

        return () => {
            document.body.classList.remove("has-tinymce-editor");
        };
    }, []);

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
