"use client";

import { useState } from "react";
import { IBlogCreateOrUpdate } from "@/apis/blog/blog.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BasicDialogFooter as DialogFooter } from "@/components/ui/basic-dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ClientSideCustomEditor from "@/components/ui/TinyMCE/ClientSideCustomEditor";
import BlogFileUploader from "./blog-file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import blogApi from "@/apis/blog/blog.api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApi } from "@/hooks/useApi";
import { useAsyncEffect } from "@/hooks";

export interface BlogDetailProps {
    newsId?: number;
    initialData?: IBlogCreateOrUpdate;
    onClose: () => void;
    onSubmit: (blogData: IBlogCreateOrUpdate) => Promise<void>;
    submitButtonText: string;
    loadingText: string;
}

export default function BlogDetail({
    newsId,
    initialData = {
        newsId: 0,
        newsTitle: "",
        newsBanner: "",
        newsThumbnail: "",
        newsDetailContent: "",
        newsShortContent: "",
        state: true,
        uploadFile: "",
    },
    onClose,
    onSubmit,
    submitButtonText,
    loadingText,
}: BlogDetailProps) {
    const [formData, setFormData] = useState<IBlogCreateOrUpdate>(initialData);
    const [actualFileObjects, setActualFileObjects] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidationError, setShowValidationError] = useState(false);

    // Set up API hooks
    const { request: getBlogDetail, loading: isLoadingBlog } = useApi(blogApi.getBlogDetail);

    // Fetch blog data by ID
    const fetchBlogData = async (id: number) => {
        try {
            // Use the useApi hook to make the API call
            await getBlogDetail(
                { params: { newId: id } },
                // Success callback
                (response: any) => {
                    if (response.isSuccess && response.data) {
                        // Prepare data with existing image
                        const blogData = {
                            ...response.data,
                            // If uploadFile doesn't exist, use empty string
                            uploadFile: response.data.uploadFile || "",
                            // Ensure newsThumbnail is a valid URL or empty string
                            newsThumbnail: response.data.newsThumbnail || "",
                        } as IBlogCreateOrUpdate;

                        // Validate newsThumbnail URL
                        if (blogData.newsThumbnail) {
                            try {
                                new URL(blogData.newsThumbnail);
                            } catch (error) {
                                console.warn("Invalid newsThumbnail URL:", blogData.newsThumbnail);
                                blogData.newsThumbnail = ""; // Reset to empty string if invalid
                            }
                        }

                        setFormData(blogData);
                    } else {
                        toast.error("Không thể tải thông tin bài viết");
                    }
                },
                // Error callback
                (error) => {
                    console.error("Error fetching blog data:", error);
                    toast.error("Lỗi khi tải thông tin bài viết");
                }
            );
        } catch (error) {
            console.error("Error in fetchBlogData:", error);
        }
    };

    // Load blog data if ID is provided using useAsyncEffect
    useAsyncEffect(async () => {
        if (newsId && newsId > 0) {
            await fetchBlogData(newsId);
        }
    }, [newsId]);

    // Handle text input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle switch toggle for state
    const handleStateChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            state: checked,
        }));
    };

    // Handle editor content changes
    const handleEditorChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle image changes
    const handleImagesChange = (files: File[]) => {
        setActualFileObjects(files);

        // If files array is empty, it means the existing image was removed
        if (files.length === 0) {
            setFormData((prev) => ({
                ...prev,
                newsThumbnail: "", // Clear the existing image
                uploadFile: "", // Clear any upload in progress
            }));
        }
    };

    // Validate form data
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.newsTitle || !formData.newsTitle.trim()) {
            newErrors.newsTitle = "Tiêu đề không được để trống";
        }

        if (!formData.newsShortContent || !formData.newsShortContent.trim()) {
            newErrors.newsShortContent = "Mô tả ngắn không được để trống";
        }

        if (!formData.newsDetailContent || !formData.newsDetailContent.trim()) {
            newErrors.newsDetailContent = "Nội dung chi tiết không được để trống";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            setShowValidationError(true);
            return;
        }

        setIsLoading(true);

        try {
            let updatedBlogData: IBlogCreateOrUpdate;

            if (actualFileObjects.length > 0) {
                // Convert file to base64
                const file = actualFileObjects[0]; // Only use the first file

                try {
                    const base64String = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            resolve(reader.result as string);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    // Create a blog object with the base64 encoded file
                    updatedBlogData = {
                        ...formData,
                        uploadFile: base64String,
                    };
                } catch (error) {
                    console.error("Error converting file to base64:", error);
                    throw error;
                }
            } else {
                // No new file, keep existing data
                updatedBlogData = {
                    ...formData,
                    uploadFile: "",
                };
            }

            // Submit the data
            await onSubmit(updatedBlogData);
            onClose();
        } catch (error) {
            console.error("Error submitting blog:", error);
            toast.error("Lỗi khi lưu bài viết");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-200px)]">
            {/* Validation Alert */}
            {showValidationError && Object.keys(errors).length > 0 && (
                <Alert className="mb-4 bg-destructive/15 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Vui lòng điền đủ dữ liệu trước khi lưu.</AlertDescription>
                </Alert>
            )}

            {/* Loading Indicator */}
            {isLoadingBlog && (
                <div className="mb-4 flex items-center justify-center p-4 bg-blue-50 rounded-md">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-blue-500">Đang tải thông tin bài viết...</span>
                </div>
            )}

            {/* Required Fields Note */}
            <div className="mb-4 text-sm text-gray-500">
                <span className="text-red-500">*</span> Trường bắt buộc
            </div>

            {/* Scrollable Content Area */}
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                    {/* Blog Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="newsTitle" className="required">
                            Tiêu đề <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="newsTitle"
                            name="newsTitle"
                            value={formData.newsTitle}
                            onChange={handleInputChange}
                            className={errors.newsTitle ? "border-red-500" : ""}
                        />
                        {errors.newsTitle && (
                            <p className="text-red-500 text-sm">{errors.newsTitle}</p>
                        )}
                    </div>

                    {/* Blog Short Content */}
                    <div className="grid gap-2">
                        <Label htmlFor="newsShortContent" className="required">
                            Mô tả ngắn <span className="text-red-500">*</span>
                        </Label>
                        <div
                            className={
                                errors.newsShortContent ? "border border-red-500 rounded-md" : ""
                            }
                        >
                            <ClientSideCustomEditor
                                initialValue={formData.newsShortContent}
                                value={formData.newsShortContent}
                                onChange={(value) => handleEditorChange("newsShortContent", value)}
                                height="300px"
                            />
                        </div>
                        {errors.newsShortContent && (
                            <p className="text-red-500 text-sm">{errors.newsShortContent}</p>
                        )}
                    </div>

                    {/* Blog Images */}
                    <div className="grid gap-2">
                        <BlogFileUploader
                            initialImages={
                                formData.newsThumbnail && formData.newsThumbnail.trim() !== ""
                                    ? [formData.newsThumbnail]
                                    : []
                            }
                            onImagesChange={handleImagesChange}
                            maxFiles={1}
                            label="Ảnh đại diện"
                        />
                    </div>

                    {/* Blog State */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="state"
                            checked={formData.state}
                            onCheckedChange={handleStateChange}
                        />
                        <Label htmlFor="state">Hiển thị bài viết</Label>
                    </div>

                    {/* Blog Detail Content */}
                    <div className="grid gap-2">
                        <Label htmlFor="newsDetailContent" className="required">
                            Nội dung chi tiết <span className="text-red-500">*</span>
                        </Label>
                        <div
                            className={
                                errors.newsDetailContent ? "border border-red-500 rounded-md" : ""
                            }
                        >
                            <ClientSideCustomEditor
                                initialValue={formData.newsDetailContent}
                                value={formData.newsDetailContent}
                                onChange={(value) => handleEditorChange("newsDetailContent", value)}
                                height="600px"
                            />
                        </div>
                        {errors.newsDetailContent && (
                            <p className="text-red-500 text-sm">{errors.newsDetailContent}</p>
                        )}
                    </div>
                </div>
            </ScrollArea>

            {/* Form Actions - Fixed at Bottom */}
            <DialogFooter className="mt-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {loadingText}
                        </>
                    ) : (
                        submitButtonText
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
