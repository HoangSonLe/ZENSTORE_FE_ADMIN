"use client";

import blogApi from "@/apis/blog/blog.api";
import { IBlogCreateOrUpdate } from "@/apis/blog/blog.interface";
import { toast } from "sonner";
import BlogDetail from "./blog-detail";

interface CreateBlogDetailProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateBlogDetail({ onClose, onSuccess }: CreateBlogDetailProps) {
    const handleCreateBlog = async (blogData: IBlogCreateOrUpdate) => {
        try {
            // Call the API to create the blog
            await blogApi.createOrUpdateBlogDetail({
                body: blogData,
            });

            toast.success("Bài viết đã được tạo thành công");

            // Call the onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error creating blog:", error);
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
