"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface CKEditorWrapperProps {
  data: string;
  onChange: (data: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  onReady?: (editor: any) => void;
}

export default function CKEditorWrapper({
  data,
  onChange,
  placeholder = "Type your content here...",
  className,
  height = "200px",
  onReady,
}: CKEditorWrapperProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onReady={onReady}
      config={{
        placeholder,
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "outdent",
          "indent",
          "|",
          "blockQuote",
          "insertTable",
          "undo",
          "redo",
        ],
      }}
      onChange={(_, editor) => {
        const editorData = editor.getData();
        onChange(editorData);
      }}
    />
  );
}
