"use client";

import blogApi from "@/apis/blog/blog.api";
import { IBlogCreateOrUpdate } from "@/apis/blog/blog.interface";
import { toast } from "sonner";
import BlogDetail from "./blog-detail";
import { useApi } from "@/hooks/useApi";

interface CreateBlogDetailProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateBlogDetail({ onClose, onSuccess }: CreateBlogDetailProps) {
    // Set up API hooks
    const { request: createOrUpdateBlog, loading: isCreating } = useApi(
        blogApi.createOrUpdateBlogDetail
    );

    const handleCreateBlog = async (blogData: IBlogCreateOrUpdate) => {
        try {
            // Call the API to create the blog using the useApi hook
            await createOrUpdateBlog(
                {
                    body: blogData,
                    method: "POST",
                },
                // Success callback
                () => {
                    toast.success("Bài viết đã được tạo thành công");

                    // Call the onSuccess callback if provided
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                // Error callback
                (error) => {
                    console.error("Error creating blog:", error);
                    toast.error("Lỗi tạo bài viết");
                }
            );
        } catch (error) {
            console.error("Error in handleCreateBlog:", error);
            toast.error("Lỗi tạo bài viết");
        }
    };

    return (
        <BlogDetail
            onClose={onClose}
            onSubmit={handleCreateBlog}
            submitButtonText="Tạo mới"
            loadingText="Đang tạo..."
        />
    );
}
