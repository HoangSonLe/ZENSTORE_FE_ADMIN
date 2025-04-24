"use client";
// TinyMCE so the global var exists
import "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
import "tinymce/skins/ui/oxide/skin";
// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
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
// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";
// Content styles, including inline UI like fake cursors
import "tinymce/skins/content/default/content";
import "tinymce/skins/ui/oxide/content";

import { Editor } from "@tinymce/tinymce-react";
import { forwardRef, memo, useImperativeHandle, useRef } from "react";

// Define the methods you want to expose to the parent
export interface CKEditorRef {
    getContent: () => string;
}

export interface CKEditorProps {
    initialValue?: string | undefined;
    morePlugins?: string[];
    height?: string;
    onChange: (content: string) => void;
}

const CKEditor = forwardRef<CKEditorRef, CKEditorProps>(
    ({ initialValue, height, morePlugins, onChange }, ref) => {
        const editorRef = useRef<any>(null);

        // Expose methods to parent using useImperativeHandle
        useImperativeHandle(ref, () => ({
            getContent: () => {
                return editorRef.current ? editorRef.current.getContent() : "";
            },
        }));

        const toolbar =
            "undo redo | accordion accordionremove | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify align | " +
            "bullist numlist outdent indent lineheight | " +
            "link image table media | " +
            "charmap emoticons codesample code fullscreen preview save print | " +
            "pagebreak anchor | ltr rtl | removeformat | help";

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
            "codesample",
            "charmap",
            "pagebreak",
            "nonbreaking",
            "insertdatetime",
            // 'quickbars',
            "emoticons",
            ...(morePlugins ?? []),
        ];

        return (
            <Editor
                onInit={(_, editor) => {
                    editorRef.current = editor;
                }}
                initialValue={initialValue}
                init={{
                    height: height ?? 500,
                    // menubar: 'file edit view insert format tools table help',
                    menubar: false,
                    plugins: plugins,
                    toolbar: toolbar,
                    content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    // quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quicktable',
                    // quickbars_insert_toolbar: false,
                    noneditable_class: "mceNonEditable",
                    toolbar_mode: "sliding",
                    contextmenu: "link image table",
                    importcss_append: true,
                    branding: false,
                    file_picker_types: "file image media",

                    // Áp dụng cho cả file, image, media
                    file_picker_callback: (cb, value, meta) => {
                        const input = document.createElement("input");

                        input.setAttribute("type", "file");

                        // Chọn lọc theo meta.filetype (file, image, media)
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
                onEditorChange={onChange}
            />
        );
    }
);

export default memo(CKEditor);
