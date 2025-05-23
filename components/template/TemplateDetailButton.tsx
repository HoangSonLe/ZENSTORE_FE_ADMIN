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
import { useApi } from "@/hooks/useApi";

// Utility function to get display name from template code or ID
const getTemplateDisplayName = (template: ITemplate): string => {
    // If you have a mapping of codes to display names, you could use it here
    // For now, we'll use the code as the display name
    return template.templateCode || `Template ${template.templateId}`;
};

interface TemplateDetailButtonProps {
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

const TemplateDetailButton: React.FC<TemplateDetailButtonProps> = ({
    className,
    onTemplateSelect,
}) => {
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);

    // Set up API hooks
    const { request: getTemplateList, loading } = useApi(templateApi.GetTemplateList);

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
        try {
            // Use the useApi hook to make the API call
            await getTemplateList(
                {
                    params: {
                        templateCode: searchText || undefined,
                        pageNumber: 1,
                        pageSize: 100,
                    },
                },
                // Success callback
                (response: any) => {
                    if (response.isSuccess && response.data) {
                        // Convert templates to tree structure
                        const tree = convertToTreeData(response.data.data);
                        setTreeData(tree);
                    }
                },
                // Error callback
                (error) => {
                    console.error("Error fetching templates:", error);
                }
            );
        } catch (error) {
            console.error("Error in fetchTemplates:", error);
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
                label: getTemplateDisplayName(template), // Use code instead of name
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
                label: getTemplateDisplayName(representativeTemplate), // Use code instead of name
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

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className={className}
                onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setOpen(true);
                }}
                title="Mô tả chi tiết"
                type="button" // Explicitly set button type to prevent form submission
            >
                <FileText className="h-4 w-4" />
                <span className="ml-2">Mẫu mô tả</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent size="4xl" className="p-0 max-w-4xl w-full">
                    <div className="flex h-[80vh]">
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
                            <div className="p-4 border-b border-border flex justify-between items-center">
                                <h3 className="text-lg font-medium">
                                    {selectedTemplate
                                        ? getTemplateDisplayName(selectedTemplate)
                                        : "Chọn mẫu để xem chi tiết"}
                                </h3>
                                {selectedTemplate && onTemplateSelect && (
                                    <Button
                                        size="sm"
                                        type="button" // Explicitly set button type to prevent form submission
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent form submission
                                            onTemplateSelect(selectedTemplate);
                                            setOpen(false);
                                        }}
                                    >
                                        Chèn mẫu
                                    </Button>
                                )}
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
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TemplateDetailButton;
