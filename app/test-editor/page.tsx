"use client";

import { useState } from "react";
import CKEditor from "@/components/ui/CKEditor/CKEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestEditorPage() {
  const [content, setContent] = useState("<p>Test content</p>");
  const [displayContent, setDisplayContent] = useState("");

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleShowContent = () => {
    setDisplayContent(content);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>TinyMCE Editor Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <CKEditor
              initialValue={content}
              onChange={handleEditorChange}
              height="300px"
            />
          </div>
          
          <Button onClick={handleShowContent} className="mb-4">
            Show Content
          </Button>
          
          {displayContent && (
            <div className="mt-4 p-4 border rounded">
              <h3 className="text-lg font-medium mb-2">Editor Content:</h3>
              <div dangerouslySetInnerHTML={{ __html: displayContent }} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
