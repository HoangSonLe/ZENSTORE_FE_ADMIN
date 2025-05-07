"use client";

import blogApi from "@/apis/blog/blog.api";
import { IBlog, IBlogCreateOrUpdate } from "@/apis/blog/blog.interface";
import { toast } from "sonner";
import BlogDetail from "./blog-detail";
import { useApi } from "@/hooks/useApi";

interface UpdateBlogDetailProps {
    blog: IBlog;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateBlogDetail({ blog, onClose, onSuccess }: UpdateBlogDetailProps) {
    // Set up API hooks
    const { request: updateBlog, loading: isUpdating } = useApi(blogApi.createOrUpdateBlogDetail);

    const handleUpdateBlog = async (blogData: IBlogCreateOrUpdate) => {
        try {
            // Merge the existing blog with the updated data
            const updatedBlog: IBlogCreateOrUpdate = {
                ...blog,
                ...blogData,
            };

            // Call the API to update the blog using the useApi hook
            await updateBlog(
                {
                    body: updatedBlog,
                    method: "POST",
                },
                // Success callback
                () => {
                    toast.success("Bài viết đã được cập nhật thành công");

                    // Call the onSuccess callback if provided
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                // Error callback
                (error) => {
                    console.error("Error updating blog:", error);
                    toast.error("Lỗi cập nhật bài viết");
                }
            );
        } catch (error) {
            console.error("Error in handleUpdateBlog:", error);
            toast.error("Lỗi cập nhật bài viết");
        }
    };

    return (
        <BlogDetail
            newsId={blog.newsId}
            onClose={onClose}
            onSubmit={handleUpdateBlog}
            submitButtonText="Lưu thay đổi"
            loadingText="Đang lưu..."
        />
    );
}
