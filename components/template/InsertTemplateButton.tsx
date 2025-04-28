"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tree } from "@/components/ui/tree";
import { Search, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import templateApi from "@/apis/template/template.api";
import { ITemplate, ITemplateQuery } from "@/apis/template/template.interface";

interface InsertTemplateButtonProps {
    className?: string;
    onTemplateSelect?: (template: ITemplate) => void;
}

interface TreeNodeData {
    id: string;
    label: string;
    children?: TreeNodeData[];
    checked?: boolean;
    icon?: React.ReactNode;
    templateData?: ITemplate;
}

const InsertTemplateButton: React.FC<InsertTemplateButtonProps> = ({
    className,
    onTemplateSelect,
}) => {
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch templates when modal opens
    useEffect(() => {
        if (open) {
            fetchTemplates();
        }
    }, [open]);

    // Fetch templates with search
    useEffect(() => {
        if (open) {
            const delayDebounceFn = setTimeout(() => {
                fetchTemplates();
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchText, open]);

    // Fetch templates from API
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await templateApi.GetTemplateList({
                params: {
                    templateCode: searchText || undefined,
                    pageNumber: 1,
                    pageSize: 100,
                },
            });

            if (response.isSuccess && response.data) {
                setTemplates(response.data.data);

                // Convert templates to tree structure
                const tree = convertToTreeData(response.data.data);
                setTreeData(tree);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
    };

    // Convert flat template list to tree structure
    const convertToTreeData = (templates: ITemplate[]): TreeNodeData[] => {
        // Group templates by code prefix (assuming codes like "GROUP1.SUBGROUP.TEMPLATE")
        const groups: { [key: string]: { children: TreeNodeData[]; templates: ITemplate[] } } = {};

        templates.forEach((template) => {
            const parts = template.templateCode.split(".");
            const groupKey = parts[0];

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    children: [],
                    templates: [],
                };
            }

            groups[groupKey].children.push({
                id: template.templateId.toString(),
                label: template.templateName,
                icon: <FileText className="h-4 w-4" />,
                templateData: template,
            });

            groups[groupKey].templates.push(template);
        });

        // Convert groups to tree nodes using templateName as label
        return Object.entries(groups).map(([key, group]) => {
            // Find a representative template for this group to get its name
            // Sort templates by ID to get a consistent representative
            const sortedTemplates = [...group.templates].sort(
                (a, b) => a.templateId - b.templateId
            );
            const representativeTemplate = sortedTemplates[0];

            return {
                id: key,
                label: representativeTemplate.templateName, // Use templateName as label
                children: group.children,
            };
        });
    };

    // Handle template selection
    const handleSelectTemplate = (node: TreeNodeData) => {
        if (node.templateData) {
            setSelectedTemplate(node.templateData);
        }
    };

    // Handle insert button click
    const handleInsert = () => {
        if (selectedTemplate && onTemplateSelect) {
            onTemplateSelect(selectedTemplate);
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className={className}
                onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setOpen(true);
                }}
                type="button" // Explicitly set button type to prevent form submission
            >
                <FileText className="h-4 w-4 mr-2" />
                Danh sách mẫu mô tả
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent size="4xl" className="p-0 max-w-4xl w-full">
                    <div className="flex h-[80vh] flex-col">
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left side: Search and Tree */}
                            <div className="w-1/3 border-r border-border flex flex-col">
                                <div className="p-4 border-b border-border">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm mẫu..."
                                            className="pl-9"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-4">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <Tree
                                            data={treeData}
                                            onSelect={handleSelectTemplate}
                                            defaultExpandedKeys={[]}
                                            showLine={true}
                                        />
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Right side: Template Content */}
                            <div className="w-2/3 flex flex-col">
                                <div className="p-5 border-b border-border">
                                    <h3 className="text-lg font-medium">
                                        {selectedTemplate
                                            ? selectedTemplate.templateName
                                            : "Chọn mẫu để xem chi tiết"}
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1 p-4">
                                    {selectedTemplate ? (
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: selectedTemplate.templateDetailContent,
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Vui lòng chọn một mẫu từ danh sách bên trái
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>

                        {/* Footer with buttons */}
                        <div className="p-4 border-t border-border flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent form submission
                                    setOpen(false);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent form submission
                                    handleInsert();
                                }}
                                disabled={!selectedTemplate}
                            >
                                Chèn
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InsertTemplateButton;
