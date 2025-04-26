"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateDetailButton, InsertTemplateButton } from "@/components/template";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { ITemplate } from "@/apis/template/template.interface";

export default function TemplateExamplePage() {
    const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);

    const handleTemplateSelect = (template: ITemplate) => {
        setSelectedTemplate(template);
        console.log("Selected template:", template);
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Template Example</CardTitle>
                    <div className="flex items-center gap-2">
                        <TemplateDetailButton />
                        <InsertTemplateButton onTemplateSelect={handleTemplateSelect} />
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo mới
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        This is an example page demonstrating the Template components.
                    </p>
                    <p className="mb-4">
                        <strong>TemplateDetailButton:</strong> Click the "Mô tả chi tiết" button in
                        the header to open the template modal. The modal will display a searchable
                        tree of templates on the left side and the selected template's HTML content
                        on the right side.
                    </p>
                    <p className="mb-4">
                        <strong>InsertTemplateButton:</strong> Click the "Insert Template" button to
                        open a modal that allows you to select and insert a template. When you click
                        "Insert", the selected template will be returned via the onTemplateSelect
                        callback.
                    </p>

                    {selectedTemplate && (
                        <div className="mt-6 p-4 border rounded-md">
                            <h3 className="text-lg font-medium mb-2">Selected Template:</h3>
                            <p>
                                <strong>ID:</strong> {selectedTemplate.templateId}
                            </p>
                            <p>
                                <strong>Code:</strong> {selectedTemplate.templateCode}
                            </p>
                            <p>
                                <strong>Name:</strong> {selectedTemplate.templateName}
                            </p>
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Content:</h4>
                                <div
                                    className="p-4 border rounded-md prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: selectedTemplate.templateDetailContent,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
