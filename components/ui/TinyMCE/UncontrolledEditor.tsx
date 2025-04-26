"use client";

// Import all TinyMCE dependencies
import "tinymce/tinymce";
import "tinymce/models/dom/model";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/help/js/i18n/keynav/en";
import "tinymce/plugins/image";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/emoticons/js/emojis";
import "tinymce/skins/content/default/content";
import "tinymce/skins/ui/oxide/content";

import { Editor } from "@tinymce/tinymce-react";
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";

export interface UncontrolledEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
}

export interface UncontrolledEditorProps {
    initialValue?: string;
    value?: string;
    morePlugins?: string[];
    height?: string;
    onChange: (content: string) => void;
}

/**
 * An uncontrolled TinyMCE editor component that preserves cursor position
 * by avoiding React's controlled component pattern.
 */
const UncontrolledEditor = forwardRef<UncontrolledEditorRef, UncontrolledEditorProps>(
    ({ initialValue = "", value, height, morePlugins = [], onChange }, ref) => {
        const editorRef = useRef<any>(null);
        const initialContentRef = useRef(initialValue || value || "");
        const isInitializedRef = useRef(false);

        // Expose methods to parent using useImperativeHandle
        useImperativeHandle(ref, () => ({
            getContent: () => {
                return editorRef.current
                    ? editorRef.current.getContent()
                    : initialContentRef.current;
            },
            setContent: (content: string) => {
                if (editorRef.current) {
                    editorRef.current.setContent(content);
                }
            },
        }));

        // Use initialValue or value, with initialValue taking precedence
        useEffect(() => {
            if (!isInitializedRef.current) {
                initialContentRef.current = initialValue || value || "";
            }
        }, [initialValue, value]);

        const toolbar =
            "accordion accordionremove | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify align | " +
            "bullist numlist outdent indent lineheight | " +
            "link image table media | " +
            "charmap emoticons code fullscreen preview | " +
            "pagebreak | ltr rtl | removeformat";

        const plugins = [
            "advlist",
            "anchor",
            "autolink",
            "image",
            "link",
            "lists",
            "searchreplace",
            "table",
            "wordcount",
            "preview",
            "autosave",
            "directionality",
            "code",
            "visualblocks",
            "visualchars",
            "fullscreen",
            "media",
            // "codesample",
            "charmap",
            "pagebreak",
            "nonbreaking",
            "insertdatetime",
            "emoticons",
            ...(morePlugins ?? []),
        ];

        // Mark as initialized after first render
        useEffect(() => {
            isInitializedRef.current = true;
        }, []);

        // Custom onChange handler to prevent cursor jumping
        const handleEditorChange = (content: string) => {
            onChange(content);
        };

        return (
            <Editor
                onInit={(_, editor) => {
                    editorRef.current = editor;
                    isInitializedRef.current = true;
                }}
                initialValue={initialContentRef.current}
                init={{
                    height: height ?? 500,
                    menubar: false,
                    plugins: plugins,
                    toolbar: toolbar,
                    content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    noneditable_class: "mceNonEditable",
                    toolbar_mode: "sliding",
                    contextmenu: "link image table",
                    importcss_append: true,
                    branding: false,
                    file_picker_types: "file image media",
                    file_picker_callback: (cb, value, meta) => {
                        const input = document.createElement("input");
                        input.setAttribute("type", "file");

                        if (meta.filetype === "image") {
                            input.setAttribute("accept", "image/*");
                        } else if (meta.filetype === "media") {
                            input.setAttribute("accept", "video/*");
                        }

                        input.onchange = function (e: any) {
                            const file = e.target.files[0];
                            const reader = new FileReader();

                            reader.onload = function (e) {
                                const result = e.target?.result as string;
                                cb(result, { title: file.name });
                            };

                            reader.readAsDataURL(file);
                        };

                        input.click();
                    },
                }}
                onEditorChange={handleEditorChange}
            />
        );
    }
);

UncontrolledEditor.displayName = "UncontrolledEditor";

export default memo(UncontrolledEditor);
