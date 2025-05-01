"use client";

import blogApi from "@/apis/blog/blog.api";
import { IBlog, IBlogCreateOrUpdate } from "@/apis/blog/blog.interface";
import { toast } from "sonner";
import BlogDetail from "./blog-detail";

interface UpdateBlogDetailProps {
    blog: IBlog;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateBlogDetail({
    blog,
    onClose,
    onSuccess,
}: UpdateBlogDetailProps) {
    const handleUpdateBlog = async (blogData: IBlogCreateOrUpdate) => {
        try {
            // Merge the existing blog with the updated data
            const updatedBlog: IBlogCreateOrUpdate = {
                ...blog,
                ...blogData,
            };

            // Call the API to update the blog
            await blogApi.createOrUpdateBlogDetail({
                body: updatedBlog,
            });

            toast.success("Bài viết đã được cập nhật thành công");

            // Call the onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating blog:", error);
            toast.error("Lỗi cập nhật bài viết");
            throw error;
        }
    };

    return (
        <BlogDetail
            newsId={blog.newsId}
            initialData={blog as IBlogCreateOrUpdate}
            onClose={onClose}
            onSubmit={handleUpdateBlog}
            submitButtonText="Lưu thay đổi"
            loadingText="Đang lưu..."
        />
    );
}
