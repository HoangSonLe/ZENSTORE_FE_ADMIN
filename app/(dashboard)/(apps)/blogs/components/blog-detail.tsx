"use client";

import { useState, useEffect } from "react";
import { IBlog, IBlogCreateOrUpdate } from "@/apis/blog/blog.interface";
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
import { IApiResponse } from "@/apis/interface";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileWithPreview extends File {
    preview: string;
}

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
        uploadFiles: [],
    },
    onClose,
    onSubmit,
    submitButtonText,
    loadingText,
}: BlogDetailProps) {
    const [formData, setFormData] = useState<IBlogCreateOrUpdate>(initialData);
    const [blogImages, setBlogImages] = useState<FileWithPreview[]>([]);
    const [actualFileObjects, setActualFileObjects] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBlog, setIsLoadingBlog] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidationError, setShowValidationError] = useState(false);

    // Fetch blog data by ID
    const fetchBlogData = async (id: number) => {
        setIsLoadingBlog(true);
        try {
            const response = await blogApi.getBlogDetail({
                params: { newId: id },
            });

            if (response.isSuccess && response.data) {
                // Prepare data with both existing images
                const blogData = {
                    ...response.data,
                    // If uploadFiles doesn't exist, use existing image URLs
                    uploadFiles: response.data.uploadFiles || [],
                } as IBlogCreateOrUpdate;

                setFormData(blogData);
            }
        } catch (error) {
            console.error("Error fetching blog data:", error);
            toast.error("Lỗi khi tải thông tin bài viết");
        } finally {
            setIsLoadingBlog(false);
        }
    };

    // Load blog data if ID is provided
    useEffect(() => {
        if (newsId && newsId > 0) {
            fetchBlogData(newsId);
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
    };

    // Validate form data
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.newsTitle.trim()) {
            newErrors.newsTitle = "Tiêu đề không được để trống";
        }

        if (!formData.newsShortContent.trim()) {
            newErrors.newsShortContent = "Mô tả ngắn không được để trống";
        }

        if (!formData.newsDetailContent.trim()) {
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
                // Convert files to base64
                const fileConversionPromises = actualFileObjects.map(
                    (file) =>
                        new Promise<string>((resolve, reject) => {
                            try {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const base64String = reader.result as string;
                                    resolve(base64String);
                                };
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            } catch (error) {
                                console.error("Error setting up file reader:", error);
                                reject(error);
                            }
                        })
                );

                // Wait for all files to be converted to base64
                const base64Files = await Promise.all(fileConversionPromises);

                // Create a blog object with the base64 encoded files
                updatedBlogData = {
                    ...formData,
                    uploadFiles: base64Files,
                };
            } else {
                // No new files, keep existing data
                updatedBlogData = {
                    ...formData,
                    uploadFiles: [],
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
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-190px)]">
            {/* Validation Alert */}
            {showValidationError && Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Vui lòng điền đầy đủ thông tin bắt buộc.</AlertDescription>
                </Alert>
            )}

            {/* Scrollable Content Area */}
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                    {/* Blog Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="newsTitle" className="required">
                            Tiêu đề
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
                            Mô tả ngắn
                        </Label>
                        <div
                            className={
                                errors.newsShortContent ? "border border-red-500 rounded-md" : ""
                            }
                        >
                            <ClientSideCustomEditor
                                initialValue={formData.newsShortContent}
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
                            initialImages={formData.newsThumbnail ? [formData.newsThumbnail] : []}
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
                            Nội dung chi tiết
                        </Label>
                        <div
                            className={
                                errors.newsDetailContent ? "border border-red-500 rounded-md" : ""
                            }
                        >
                            <ClientSideCustomEditor
                                initialValue={formData.newsDetailContent}
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
