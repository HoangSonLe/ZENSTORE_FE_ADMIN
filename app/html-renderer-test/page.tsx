"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HtmlContentRenderer } from "@/components/ui/html-content-renderer";

export default function HtmlRendererTestPage() {
    const [content, setContent] = useState<string>(`
        <h2>This is a test of HTML content with expand/hide functionality</h2>
        <p>This is a paragraph with some <strong>bold</strong> and <em>italic</em> text.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
    `);

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>HTML Content Renderer Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">HTML Content with Expand/Hide:</h3>
                        <div className="border p-4 rounded-md">
                            <HtmlContentRenderer content={content} maxHeight={100} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">HTML Content with Larger Max Height:</h3>
                        <div className="border p-4 rounded-md">
                            <HtmlContentRenderer content={content} maxHeight={200} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">HTML Content with No Max Height (Always Expanded):</h3>
                        <div className="border p-4 rounded-md">
                            <HtmlContentRenderer content={content} maxHeight={1000} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
